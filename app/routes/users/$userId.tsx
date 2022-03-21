import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  useActionData,
  useCatch,
  useLoaderData,
  useOutletContext,
  useTransition,
} from "remix";

import UserDisplay from "~/components/user/userDisplay";

import UpdateUserForm from "~/components/user/updateUserForm";

import {
  generateAlert,
  generateExpectedError,
  generateUnexpectedError,
} from "~/utils/error";

import { requireAuth } from "~/services/authentication";
import { deleteUser, getUser, putAvatar, updateUser } from "~/services/user";
import {
  createPurchase,
  deletePurchase,
  getManyPurchase,
  UpdatePurchase,
} from "~/services/purchase";

import { CircularProgress, Container, Typography } from "@mui/material";
import { ContextData } from "~/root";
import { getSelft } from "~/services/user";
import { UpdateUserFormData, User } from "~/models/User";
import { blue } from "@mui/material/colors";
import { NodeOnDiskFile } from "@remix-run/node";

type LoaderData = {
  userResponse?: {
    error?: string;
    success?: string;
    user?: User;
  };
};

type ActionData = {
  updateUserResponse?: {
    formData?: UpdateUserFormData;
    success?: string;
    error?: string;
  };
};

async function loadUser(token: string, userId: number) {
  const { code, ...userResponse } = await getUser(token, userId);

  return json(
    {
      userResponse: {
        ...userResponse,
      },
    } as LoaderData,
    code
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.userId) {
    throw json("Invalid user query", 404);
  }

  const token = await requireAuth(request, `/user/${params.userId}`);

  return await loadUser(token, parseInt(params.userId));
};

//Validator for email field
function validateEmail(email: string) {
  if (
    !new RegExp(
      process.env["EMAIL_REGEX"] || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    ).test(email)
  ) {
    return "User email must match your student email domain";
  }
}

//Validator for pseudo field
function validatePseudo(pseudo: string) {
  if (pseudo.length < 3) {
    return "Le pseudonyme doit contenir au moins 4 caractères";
  }
}

async function handleUpdateUser(
  token: string,
  pseudo: string,
  name: string | null,
  surname: string | null,
  wallet: number,
  privilege: number,
  userId: number,
  avatar?: NodeOnDiskFile
) {
  const fields = {
    pseudo,
    name,
    surname,
    wallet,
    privilege,
    avatar,
  };
  const fieldsError = {
    pseudo: validatePseudo(pseudo),
  };

  if (Object.values(fieldsError).some(Boolean)) {
    return json(
      { updateUserResponse: { fields, fieldsError } } as ActionData,
      400
    );
  }

  const { code, ...updateUserResponse } = await updateUser(
    token,
    fields,
    userId
  );

  if (updateUserResponse.error || !updateUserResponse.userId) {
    return json(
      {
        updateUserResponse,
      } as ActionData,
      code
    );
  }

  if (avatar) {
    const { code: uploadCode, ...uploadAvatarResponse } = await putAvatar(
      token,
      updateUserResponse.userId,
      avatar
    );

    return json(
      {
        updateUserResponse: {
          ...uploadAvatarResponse,
          formData: { fields, fieldsError },
        },
      } as ActionData,
      uploadCode
    );
  }

  return json(
    {
      updateUserResponse,
    } as ActionData,
    code
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.userId) {
    return json(
      {
        updateUserResponse: { error: "Requête utilisateur invalide" },
      } as ActionData,
      404
    );
  }

  const token = await requireAuth(request, `/user/${params.challengeId}`);

  const form = await unstable_parseMultipartFormData(
    request,
    unstable_createFileUploadHandler({ maxFileSize: 6_000_000 })
  );
  const pseudo = form.get("pseudo");
  const name = form.get("name");
  const surname = form.get("surname");
  const wallet = form.get("wallet");
  const privilege = form.get("privilege");
  const avatar = form.get("avatar");

  if (
    typeof pseudo !== "string" ||
    (typeof name !== "string" && name !== null) ||
    (typeof surname !== "string" && surname !== null) ||
    typeof wallet !== "string" ||
    typeof privilege !== "string" ||
    (!(avatar instanceof NodeOnDiskFile) && avatar !== null)
  ) {
    return json(
      {
        updateUserResponse: {
          error:
            "Les données spécifiées sont invalide, veuillez vérifier leur conformité",
        },
      } as ActionData,
      400
    );
  }
  return await handleUpdateUser(
    token,
    pseudo,
    name,
    surname,
    parseInt(wallet),
    parseInt(privilege),
    parseInt(params.userId),
    avatar?.size ? avatar : undefined
  );
};

// For the Auteur of the user, replace displays by inputs
function displayUser(
  user: User,
  formData?: UpdateUserFormData,
  userId?: number,
  userPrivilege?: number,
  API_URL?: string,
  userInfo?: User
) {
  if (user.id === userId || (userPrivilege && userPrivilege >= 2)) {
    return (
      <div>
        <UpdateUserForm
          userInfo={userInfo}
          API_URL={API_URL}
          user={user}
          formData={formData}
        />
      </div>
    );
  } else {
    return (
      <div>
        <UserDisplay API_URL={API_URL} user={user} />
      </div>
    );
  }
}

export default function UserInfoDisplay() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const { userInfo, API_URL } = useOutletContext<ContextData>();

  const transition = useTransition();

  return (
    <Container style={{ marginTop: "100px", marginBottom: "100px" }}>
      <Container style={{ marginTop: "50px" }} component="main" maxWidth="md">
        <Typography variant="h4">Utilisateur</Typography>
        {generateAlert("error", loaderData.userResponse?.error)}
        {generateAlert("error", actionData?.updateUserResponse?.error)}
        {generateAlert("success", actionData?.updateUserResponse?.success)}
        {generateAlert(
          "info",
          loaderData.userResponse?.success && !loaderData.userResponse?.user
            ? "Nous ne trouvons pas d'utilisateur associé"
            : undefined
        )}
        {loaderData.userResponse?.user && (
          <div>
            {displayUser(
              loaderData.userResponse?.user,
              actionData?.updateUserResponse?.formData,
              userInfo?.id,
              userInfo?.privilege,
              API_URL,
              userInfo
            )}
          </div>
        )}
        {transition.state === "submitting" && (
          <CircularProgress
            size={36}
            sx={{
              color: blue[500],
              position: "absolute",
              left: "50%",
              marginTop: "18px",
              marginLeft: "-18px",
            }}
          />
        )}
      </Container>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return generateExpectedError(caught);
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return generateUnexpectedError(error);
}
