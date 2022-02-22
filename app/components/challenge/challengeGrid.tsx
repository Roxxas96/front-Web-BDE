import { Grid, Typography } from "@mui/material";
import { Challenge } from "~/models/Challenge";
import ChallengeTile from "./challengeTile";

export default function ChallengeGrid({
  challenges,
}: {
  challenges?: Challenge[];
}) {
  return (
    <div>
      <Typography style={{ textAlign: "center" }} variant="h2">
        Challenges
      </Typography>
      <Grid
        style={{ marginTop: "50px" }}
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 1, sm: 8, md: 12 }}
      >
        {challenges?.map((challenge) => (
          <ChallengeTile challenge={challenge}></ChallengeTile>
        ))}
      </Grid>
    </div>
  );
}
