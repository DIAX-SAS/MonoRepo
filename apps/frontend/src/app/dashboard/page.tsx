"use client";

import Cycles from "@/components/dashboard/blocks/cycles";
import Energy from "@/components/dashboard/blocks/energy";
import Indicators from "@/components/dashboard/blocks/indicators";
import Material from "@/components/dashboard/blocks/material";
import Mounting from "@/components/dashboard/blocks/mounting";
import Oee from "@/components/dashboard/blocks/oee-factor";
import { TasksProgress } from "@/components/dashboard/blocks/tasks-progress";
import FiltersWithDateRangeAndSelect from "@/components/dashboard/blocks/tasks-progress-with-filters";
import { TaskData, type EntireObject } from "@/types/data";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import { useState } from "react";

export default function Page(): React.JSX.Element {
  const [entireObjectS, setEntireObject] = useState<string | null>(null);

 
  const entireObject: EntireObject | null = entireObjectS
    ? JSON.parse(entireObjectS)
    : null;

  return (
    <Grid container spacing={3}>
      <Grid lg={12} sm={12} xs={12}>
        <FiltersWithDateRangeAndSelect
          data={entireObject?.stateVariables || []}
          setEntireObject={setEntireObject}
        />
      </Grid>
      {entireObject?.tasksData?.map((task) => (
        <Grid key={task.name} lg={3} sm={6} xs={12}>
          <TasksProgress data={task as TaskData} sx={{ height: "100%" }} />
        </Grid>
      ))}
      {entireObject && (
        <>
          <Grid lg={12} sm={12} xs={12}>
            <Indicators data={entireObject.indicatorsData} />
          </Grid>
          {entireObject.factorsOee.map((factor, index) => (
            <Grid lg={6} sm={6} xs={12} key={index}>
              <Oee title={factor.title} charts={factor.charts} />
            </Grid>
          ))}         
          <Grid lg={6} sm={6} xs={12}>
            <Energy data={entireObject.energyData} />
          </Grid>
          <Grid lg={6} sm={6} xs={12}>
            <Material data={entireObject.materialData} />
          </Grid>
          <Grid lg={6} sm={6} xs={12}>
            <Cycles data={entireObject.cycleData} />
          </Grid>
          <Grid lg={6} sm={6} xs={12}>
            <Mounting input={entireObject.mountingData} />
          </Grid>
        </>
      )}
      {!entireObject && (
        <Alert severity="error">There is no data!</Alert>
      )
      }
    </Grid>
  );
}
