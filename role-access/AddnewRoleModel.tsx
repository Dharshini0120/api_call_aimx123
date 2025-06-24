"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";
import { roleAdd, roleUpdate } from "../../../services/rolesapiService";
import Loader from "../../../components/loader/loader";
import { toast } from "react-toastify";
import type { ApprovalModalProps } from "../../../components/interface/rolesInterface";

const validationSchema = Yup.object({
    name: Yup.string().required("Role name is required"),
    description: Yup.string().required("Description is required"),
});

const AddnewRoleModal: React.FC<ApprovalModalProps> = ({
    isOpen,
    onClose,
    fetchRoleDataApi,
    selectedRoleDetails,
    clearSelectedRoleDetails,
}) => {
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                if (selectedRoleDetails?.id) {
                    const res = await roleUpdate({
                        id: selectedRoleDetails.id,
                        ...values,
                    });
                    toast.success(res?.data?.message || "Role updated successfully");
                } else {
                    const res = await roleAdd(values);
                    toast.success(res?.data?.message || "Role added successfully");
                }
        
                resetForm();
                handleClose();
                fetchRoleDataApi();
            } catch (error) {
                toast.error(
                    selectedRoleDetails ? "Failed to update role" : "Failed to add role"
                );
                console.error("Error submitting form:", error);
            } finally {
                setLoading(false);
            }
        }
        
    });

    useEffect(() => {
        if (selectedRoleDetails) {
            formik.setValues({
                name: selectedRoleDetails.name || "",
                description: selectedRoleDetails.description || "",
            });
        } else {
            formik.resetForm();
        }
    }, [selectedRoleDetails, formik.setValues, formik.resetForm]); 

    const handleClose = () => {
        formik.resetForm();
        onClose();
        clearSelectedRoleDetails();
    };

    return (
        <>
            {loading && <Loader />}
            <Modal open={isOpen} >
                <Box
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-full"
                >
                    <div className="flex justify-between items-center pb-3">
                        <Typography variant="h6" className="font-bold text-md font-['Open_Sans'] text-[#000000]">
                            {selectedRoleDetails ? "Edit Role" : "Add New Role"}
                        </Typography>
                        <IconButton onClick={handleClose} className="text-gray-500 hover:text-red-500">
                            <CloseIcon />
                        </IconButton>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <Typography className="text-[15px] font-semibold font-['Open_Sans'] mb-3 text-[#000000]">
                                Role Name
                            </Typography>
                            <TextField
                                name="name"
                                placeholder="Role Name"
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled={!!selectedRoleDetails}
                                className="bg-[#FEF4ED] rounded-md"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </div>

                        <div>
                            <Typography className="text-[15px] font-semibold font-['Open_Sans'] mb-3 text-[#000000]">
                                Description
                            </Typography>
                            <TextField
                                name="description"
                                multiline
                                rows={3}
                                placeholder="Description"
                                fullWidth
                                variant="outlined"
                                size="small"
                                className="bg-[#FEF4ED] rounded-md"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </div>

                        <div className="flex justify-center items-center mt-6 gap-4">
                            <Button
                                variant="outlined"
                                className="text-transform-none"
                                sx={{
                                    minWidth: "180px",
                                    height: "40px",
                                    backgroundColor: "#FFFFFF",
                                    borderColor: "#F6692F",
                                    color: "#F6692F",
                                    "&:hover": {
                                        backgroundColor: "#FFF5E5",
                                        borderColor: "#FF8C00",
                                        color: "#FF8C00",
                                    },
                                    fontFamily: "Open Sans",
                                    
                                    fontWeight: "bold",
                                }}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-orange-600 to-orange-300 text-white px-4 py-2 rounded-md font-bold transition-all cursor-pointer duration-300 flex items-center justify-center w-40"
                            >
                                {selectedRoleDetails ? "Update Role" : "Add Role"}
                            </button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default AddnewRoleModal;
