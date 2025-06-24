"use client";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDocketMetrics } from "../../../../services/desApiService";
import { RootState, useAppSelector } from "../../../../store/store";

function ProjectResultContent() {
  const router = useRouter();

  const dockerData = useAppSelector(
    (state: RootState) => state?.docket?.docketList
  ) as {
    projectId: string;
    modelName?: string;
    specialty?: string;
    type?: string;
  };

  interface Metric {
    metric: string;
    value: string | number;
  }

  const [metricsData, setMetricsData] = useState<Metric[]>([]);

  useEffect(() => {
    if (dockerData.projectId && dockerData.projectId !== "N/A") {
      fetchDocketMetrics(dockerData.projectId);
    }
  }, [dockerData.projectId]);

  const fetchDocketMetrics = async (projectId: string) => {
    console.log("Fetching metrics for projectId:", projectId);
    try {
      const res = await getDocketMetrics(projectId);
      const rawData = res?.data?.metadata?.[0]?.Value;
      const metricsData = rawData?.find((item: any) => item.Key === "data")?.Value;
      const metricsValue = metricsData?.find((item: any) => item.Key === "metrics")?.Value;

      const transformed = metricsValue.map((metricArray: { Key: string; Value: string | number }[]) => {
        const metricObj: Record<string, string | number> = {};
        metricArray.forEach((item) => {
          metricObj[item.Key] = item.Value;
        });
        return {
          metric: metricObj.key,
          value: metricObj.value,
        };
      });

      console.log("Transformed Metrics:", transformed);
      setMetricsData(transformed);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  const projectInfo = [
    { label: "Project Name", value: dockerData?.modelName ?? "N/A" },
    { label: "Speciality", value: dockerData?.specialty ?? "N/A" },
    { label: "Type of the Model", value: dockerData?.type ?? "N/A" },
  ];

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: "#66717F" }} fontWeight="bold">
          AI Model Evaluation Results - {dockerData.projectId}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            minWidth: "150px",
            color: "#66717F",
            fontWeight: "bold",
            borderColor: "#FA682C",
            "&:hover": {
              backgroundColor: "#FFF1EA",
            },
          }}
          onClick={() => router.push("/project-dockets")}
        >
          <ArrowBackIcon fontSize="small" />
          Back
        </Button>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        border="2px solid #F97316"
        borderRadius="8px"
        mb={3}
      >
        {projectInfo.map((info) => (
          <Box
            key={info.label}
            borderRight={info.label !== "Type of the Model" ? "1px solid #F97316" : "none"}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={2}
          >
            <Typography fontWeight={600} align="center">
              {info.label}
            </Typography>
            <Typography variant="body2" align="center" sx={{ wordBreak: "break-word" }}>
              {info.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Table >
        <TableHead>
          <TableRow className="bg-gradient-to-r font-bold from-orange-400 to-orange-200 text-sm sm:text-base text-white" >
            <TableCell sx={{ color: "white" }}><b>Metrices</b></TableCell>
            <TableCell sx={{ color: "white" }}><b>Values</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metricsData.length > 0 ? (
            metricsData.map((row, index) => (
              <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#FFF5EB" : "white" }}>
                <TableCell>{row.metric}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>No metrics available.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function ProjectResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectResultContent />
    </Suspense>
  );
}
