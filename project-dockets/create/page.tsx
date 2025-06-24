"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Card,
  Typography,
  Divider,
  Box,
  IconButton,
  Drawer,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./style.css";
import FormFieldRenderer from "../../../../components/forms/renderFields";
import type {
  FormConfig,
  FormField,
  FormSection,
} from "../../../../components/interface/formInterface";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Loader from "../../../../components/loader/loader";
import {
  desFormGet,

  registerCreate,
  sendforEvaluation,
} from "../../../../services/desApiService";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import UploadDrawerForm from "../../datasets/create/uploadeDrawer";

import { docketUpload } from "../../../../services/uploadApiService";
import { taggingDatasetList } from "../../../../services/dataSetapiService";
import { tailwindStyles } from "../../../../styles/tailwindStyles";


export default function ProjectDocketForm() {
  const router = useRouter();
  const [formConfig, setFormConfig] = useState<FormConfig>({
    sections: [],
    fields: [],
    type: 0,
    metadata: {
      dataType: "",
      taskType: "",
      modelFramework: "",
      modelArchitecture: "",
      modelWeightUrl: { path: "" },
      modelDatasetUrl: "",
    },
  });
  const [, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [formStatus, setFormStatus] = useState<number | null>(null);
  type DatasetValue = {
    id: string;
    int_uuid: string;
    name: string;
  };
  const [datasetValues, setDatasetValues] = useState<DatasetValue[]>([]);
  console.log("datasetValues", datasetValues);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { file_path: string; id: string }>
  >({});
  const [drawerContinued, setDrawerContinued] = useState(false);
  const [modelWeightUrl, setModelWeightUrl] = useState<{
    link: string;
    pat: string;
    type: string; // Add type to track the repository type
  }>({
    link: "",
    pat: "",
    type: "",
  });


  const handleUploadedFile = (data: { file_path: string; id: string }) => {
    setUploadedFiles((prev) => ({
      ...prev,
      upload_file: data,
    }));

    const fileUploadField = formConfig.fields.find((field) => field.type === 7);
    if (fileUploadField) {
      formik.setFieldValue(fileUploadField.id.toString(), data);
    }
  };

  const handleLinkData = (data: { link: string; pat: string; type: string }) => {
    setModelWeightUrl(data); // Update the state with the repository type
    setDrawerContinued(true);

    // Also set the formik value if needed
    const fileUploadField = formConfig.fields.find((field) => field.type === 7);
    if (fileUploadField) {
      formik.setFieldValue(fileUploadField.id.toString(), {
        file_path: data.link,
        id: "link-upload",
        type: data.type, // Pass the type to formik
      });
    }
  };

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        const desformvalue = (await desFormGet({
          type: 3,
        })) as { data: FormConfig };
        setFormConfig(desformvalue.data);
        const datasetFormvalue = await taggingDatasetList();
        setDatasetValues(datasetFormvalue?.data || []);
      } catch (err) {
        console.error("Failed to fetch form data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleOpenDrawer = () => {
    setOpen(true);
    setDrawerContinued(false);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  const { initialValues, validationSchema } = useMemo(() => {
    const initialVals: Record<
      string,
      string | number | boolean | File | File[] | null
    > = {};
    const validationShape: Record<string, Yup.AnySchema> = {};

    for (const field of formConfig.fields) {
      initialVals[field.id] = "";

      if (field.required) {
        switch (field.type) {
          case 1:
            if (field.textfieldtype === "number") {
              let schema = Yup.number()
                .typeError("Must be a valid number")
                .required(`${field.label} is required`);

              if (field.min !== undefined) {
                schema = schema.min(field.min, `Minimum value is ${field.min}`);
              }
              if (field.max !== undefined) {
                schema = schema.max(field.max, `Maximum value is ${field.max}`);
              }
              validationShape[field.id] = schema;
            } else if (
              field.label.includes("email") ||
              field.label.includes("Email")
            ) {
              validationShape[field.id] = Yup.string()
                .matches(
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  "Must be a valid email address",
                )
                .required(`${field.label} is required`);
            } else if (
              field.label.includes("Phone Number") ||
              field.label.includes("phone number")
            ) {
              validationShape[field.id] = Yup.string()
                .matches(
                  /^[+]?[0-9]{1,4}?[-.\s\(\)]?(\(?[0-9]{1,3}?\)?[-.\s]?)?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}$/,
                  "Must be a valid phone number",
                )
                .required(`${field.label} is required`);
            } else {
              validationShape[field.id] = Yup.string().required(
                `${field.label} is required`,
              );
            }
            break;

          case 3:
            validationShape[field.id] = Yup.mixed().required(
              `${field.label} is required`,
            );
            break;
          case 7:
            validationShape[field.id] = Yup.mixed()
              .required("File upload is required")
              .test(
                "fileOrLink",
                "Either file upload or link is required",
                (value) => {
                  // Accept either file upload or link
                  return (
                    (typeof value === "object" && "file_path" in value) ||
                    modelWeightUrl.link !== ""
                  );
                }
              );
            break;

          default:
            validationShape[field.id] = Yup.string().required(
              `${field.label} is required`,
            );
        }
      }
    }

    return {
      initialValues: initialVals,
      validationSchema: Yup.object(validationShape),
    };
  }, [formConfig.fields, modelWeightUrl.link]);

  const getFieldValueByLabel = (label: string) => {
    const field = formConfig.fields.find((f) => f.label === label);
    if (label === "Tagging to sample datasets" && field) {
      // Return the selected dataset ID for "Tagging to sample datasets"
      return formik.values[field.id] || "";
    }
    return field ? formik.values[field.id] : "";
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          sections: formConfig.sections,
          fields: formConfig.fields.map((field) => {
            const value = values[field.id];
            if (
              field.type === 7 &&
              typeof value === "object" &&
              value !== null &&
              "file_path" in value
            ) {
              return { ...field, value };
            }
            return { ...field, value };
          }),
          type: formConfig.type,
          status: formStatus ?? 4,
          metadata: {
            ...formConfig.metadata,
            dataType: getFieldValueByLabel("Model Type"),
            taskType: getFieldValueByLabel("Task Type"),
            modelFramework: getFieldValueByLabel("Model Framework"),
            modelDatasetUrl: getFieldValueByLabel("Tagging to sample datasets"),
            modelArchitecture: getFieldValueByLabel("Model Architecture"),
            modelWeightUrl: modelWeightUrl.link
              ? { link: modelWeightUrl.link, pat: modelWeightUrl.pat, type: modelWeightUrl.type } // Include the type
              : { path: uploadedFiles.upload_file?.file_path || "" },
          },
        };
        // Call registerCreate API
        const response = await registerCreate(payload);

        // Extract the created docket UUID from the response
        const docketUuid = response?.data?.id;

        // Only call sendforEvaluation if formStatus is 4 (Send for Evaluation)
        if (formStatus === 4 && docketUuid) {
          await sendforEvaluation({ docket_uuid: docketUuid });
          toast.success("Project Dockets Created and Sent for Evaluation successfully");
        } else if (formStatus === 4) {
          toast.error("Failed to retrieve docket UUID");
        } else {
          toast.success("Project Dockets saved as draft successfully");
        }

        setSubmitSuccess(true);
        router.push("/project-dockets");
      } catch (error) {
        console.error("Registration failed:", error);
        toast.error("Failed to create and send for evaluation");
      }
    },
  });

  const handleSelectChange = (
    e: SelectChangeEvent<string | string[]>,
    field: FormField,
  ) => {
    formik.setFieldValue(field.id.toString(), e.target.value);
  };

  const handleChange = async (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | {
        target: {
          name: string;
          value: string | number | boolean | File | File[];
          type?: string;
          checked?: boolean;
          files?: FileList;
        };
      },
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (files && files.length > 0) {
      try {
        const formData = new FormData();
        formData.append("uploadFile", files[0]);

        const uploadRes = await docketUpload(formData);
        const fullPath = uploadRes?.data?.file_path || files[0].name;
        const fileId = uploadRes?.data?.id;
        const filePath = fullPath?.replace(/^Documents\//, "");

        const fileObj = { file_path: filePath, id: fileId };

        formik.setFieldValue(name, fileObj);
        setUploadedFiles((prev) => ({
          ...prev,
          [name]: fileObj,
        }));
        setDrawerContinued(true);
      } catch (error) {
        console.error("File upload failed:", error);
        formik.setFieldError(name, "File upload failed");
      }
    } else if (type === "checkbox" || type === "switch") {
      formik.setFieldValue(name, checked);
    } else {
      formik.setFieldValue(name, value);
    }
  };

  const handleFileDelete = async (fieldId: string) => {
    const fileData = uploadedFiles[fieldId];
    if (!fileData?.file_path) return;

    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });

    const fileField = formConfig.fields.find(
      (field) => field.id.toString() === fieldId,
    );
    if (fileField) {
      formik.setFieldValue(fieldId, "");
    }
    setModelWeightUrl({ link: "", pat: "", type: "" }); // Reset modelWeightUrl
    setDrawerContinued(false);
  };

  const handleDataset = () => {
    router.push("/project-dockets");
  };

  // Add this function to check if the dataset field is empty
  const isDatasetFieldEmpty = () => {
    const datasetValue = getFieldValueByLabel("Tagging to sample datasets");
    return !datasetValue || datasetValue === "";
  };

  return (
    <>
      {loading && <Loader />}
      <div className="min-h-screen flex items-center justify-center p-4 relative d-flex">
        <div className="w-full max-w-5xl">
          <Box className="flex justify-between items-center mb-6 p-4 rounded-t-lg z-50 sticky top-0 sticky backdrop-blur-sm">
            <Typography variant="h5" className="font-bold text-[#000000]">
              Create Project Dockets
            </Typography>
            <Button
              style={{ background: "white", color: "black" }}
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleDataset}
            >
              Back
            </Button>
          </Box>

          <Card className="w-full max-w-5xl backdrop-blur-sm bg-white/90 overflow-auto shadow-xl hover:shadow-4xl transition-shadow duration-300">
            <form onSubmit={formik.handleSubmit} noValidate>
              {formConfig.sections
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map((section: FormSection) => (
                  <div key={section.id} className="mb-4">
                    <Typography variant="h6" className="mb-4 p-4">
                      {section.label}
                    </Typography>
                    <Divider className="mb-4" />
                    <div className="grid pt-4 pl-8 pr-8 grid-cols-1 md:grid-cols-2 gap-4">
                      {formConfig.fields
                        .filter(
                          (field: FormField) => field.section_id === section.id,
                        )
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map((field: FormField) => (
                          <div key={field.id}>
                            {field.type !== 7 ? (
                              <FormFieldRenderer
                                field={{
                                  ...field,
                                  value: formik.values[field.id] as
                                    | string
                                    | number
                                    | boolean
                                    | File
                                    | File[]
                                    | null,
                                }}
                                error={
                                  formik.touched[field.id] &&
                                    formik.errors[field.id]
                                    ? formik.errors[field.id]
                                    : ""
                                }
                                onChange={handleChange}
                                onSelectChange={(e) =>
                                  handleSelectChange(
                                    e as SelectChangeEvent<string | string[]>,
                                    field,
                                  )
                                }                                
                                options={
                                  field.type === 9 &&
                                    field.label === "Tagging to sample datasets"
                                    ? datasetValues.map((ds) => ({
                                      id: ds.int_uuid,
                                      name: ds.name,
                                      value:
                                        ds.int_uuid ||
                                        "Unnamed Dataset",
                                    }))
                                    : field.options
                                }
                               
                              />
                            ) : (
                              <Box>
                                {uploadedFiles.upload_file && drawerContinued ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                      padding: "8px 16px",
                                      backgroundColor: "#fff3eb"
                                    }}
                                  >
                                    <Typography variant="body1">
                                      {uploadedFiles.upload_file.file_path
                                        .length > 30
                                        ? `${uploadedFiles.upload_file.file_path.slice(0, 30)}...`
                                        : uploadedFiles.upload_file.file_path}
                                    </Typography>
                                    <Button
                                      onClick={() =>
                                        handleFileDelete("upload_file")
                                      }
                                      color="error"
                                      size="small"
                                    >
                                      Remove
                                    </Button>
                                  </Box>
                                ) : modelWeightUrl.link ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                      padding: "8px 16px",
                                      backgroundColor: "#fff3eb", 
                                    }}


                                  >
                                    <Typography variant="body1">
                                      {modelWeightUrl.link.length > 30
                                        ? `${modelWeightUrl.link.slice(0, 30)}...`
                                        : modelWeightUrl.link}
                                    </Typography>
                                    <Button
                                      onClick={() => {
                                        setModelWeightUrl({ link: "", pat: "", type: "" });
                                        setDrawerContinued(false);
                                      }}
                                      color="error"
                                      size="small"
                                    >
                                      Remove
                                    </Button>
                                  </Box>
                                ) : (
                                  <>
                                    <InputLabel sx={{ paddingBottom: "7px" }}>Upload Project Docket <span className="text-red-500 ml-1">*</span></InputLabel>
                                    <Box
                                      className="upload-button uploaded-button inputBackground "
                                      onClick={handleOpenDrawer}
                                    >
                                      <Typography
                                        variant="body1"
                                        sx={{ color: "text.secondary" }}
                                      >
                                        Upload Project Docket
                                      </Typography>
                                      <IconButton size="small" color="default">
                                        <AddIcon />
                                      </IconButton>
                                    </Box>
                                  </>
                                )}
                                {formik.touched[field.id] &&
                                  formik.errors[field.id] && (
                                    <Typography
                                      color="error"
                                      variant="body2"
                                      sx={{ mt: 1 }}
                                    >
                                      {formik.errors[field.id] as string}
                                    </Typography>
                                  )}
                              </Box>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              <Box className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setFormStatus(3); // Save as Draft
                    formik.handleSubmit();
                  }}
                  style={{
                    padding: "9px",
                    width: "200px",
                    fontSize: "15px",
                  }}
                  className={tailwindStyles.saveDraft}
                >
                  Save as Draft
                </button>

                <Button
                  type="submit"
                  onClick={() => setFormStatus(4)} // Send for Evaluation
                  variant="contained"
                  disabled={isDatasetFieldEmpty()}
                  style={{
                    padding: "9px",
                    width: "200px",
                    fontSize: "15px",
                    color: "white",
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r font-bold from-[#F45C24] to-[#FFCB80]  text-sm sm:text-base text-transform-none"
                >
                  Send for Evaluation
                </Button>
              </Box>
            </form>
          </Card>
        </div>
      </div>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: "700px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <UploadDrawerForm
          setOpen={setOpen}
          onFileUpload={handleUploadedFile}
          onContinue={handleLinkData} // Pass the updated handler
        />
      </Drawer>
     
    </>
  );
}
