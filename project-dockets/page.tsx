"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import ProjectCard from "../../../components/common/ProjectCard";
import SearchFilter from "../../../components/ui/SearchFilter";
import FilterSidebar from "../../../components/ui/FilterSidebar";
import CustomButton from "../../../components/ui/Button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { organizationList } from "../../../services/desApiService";
import TablePagination from "../../../components/ui/Pagination";
import { useAppSelector } from "../../../store/store";
import type { RootState } from "../../../store/store";
import { fetchUserById } from "../../../store/userthunk";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { useModulePermissions } from "../../../hooks/useModulePermissions";
import {  collaborator, superadmin } from "../../../constants/fieldtype";
import './style.css'

const tabs = [
  "All Projects",
  "Awaiting Evaluation",
  "AdHoc Requests",
  "Evaluated Projects",
  "Archived Projects",
];

interface role {
  description: string;
  id: string;
  name: string;
}

interface Project {
  projectId: string;
  modelName: string;
  version: string;
  type: string;
  specialty: string;
  subSpecialty: string;
  submittedOn: string;
  gpu: string;
  status: string;
  statusColor: string;
  timeCount: number;
  average_rating: number;
  taggingSampleDataset: string; // Added property
  modelArchitecture: string; // Added property
  modelFramework: string; // Added property
}

const ProjectDocketsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { canCreate, canRead, canUpdate } = useModulePermissions("Project Dockets");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ fields: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [projectListData, setProjectListData] = useState<Project[]>([]);

  const [projectListPageInfo, setProjectListPageInfo] = useState<{
    pagingInfo?: {
      total_page: number;
      current_page: number;
      item_per_page: number;
      total_items: number;
    };
  }>({});
  const allowedRoles = [...collaborator, ...superadmin];
  const [queryStrings, setQueryString] = useState<{
      page: number;
      pageSize: number;
      type: number;
      formname: string;
      filter?: string; // Added filter property
  }>({
      page: 1,
      pageSize: 10,
      type: 3,
      formname: '',
  });
  const role = useAppSelector(
    (state: RootState) => state.user?.userDetail?.role,
  ) as unknown as role;

  const userId = Cookies.get("user_id");

  const statusMap = React.useMemo(
    () => ({
      "All Projects": "",
      "Awaiting Evaluation": 4,
      "AdHoc Requests": 9,
      "Evaluated Projects": 7,
      "Archived Projects": 5,
    }),
    [],
  );

  useEffect(() => {
    if (role === undefined && userId) {
      dispatch(fetchUserById(userId));
    }
  }, [userId, role, dispatch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setQueryString(prev => ({
      ...prev,
      page: 1,
      formname: query,
    }));
  };
  // Separate state for tracking if filters should be applied
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);

  const fetchFormData = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusMap[activeTab];
      
      // Create params object
      const params = {
        ...queryStrings,
        status: status ? Number(status) : 0,
      };
      
      // Only add filter parameter if shouldApplyFilters is true
      if (shouldApplyFilters && appliedFilters.length > 0) {
        params.filter = JSON.stringify(appliedFilters);
      }

      const response = await organizationList(params);

      interface FormDtoItem {
        id: string;
        "Project Name"?: string;
        "Base Version"?: string;
        "Model Type"?: string;
        Specialty?: string;
        "Sub Speciality"?: string;
        created_at?: string;
        status?: string;
        "Required CPU"?: string;
        "Pain Points"?: number;
        like_count?: number;
      }

      const formattedData = response?.data?.formdtoData?.map(
        (item: FormDtoItem) => ({
          projectId: item.id,
          modelName: item["Project Name"] || "N/A",
          version: item["Base Version"] || "N/A",
          type: item["Model Type"] || "N/A",
          gpu: item["Required CPU"] || "N/A",
          specialty: item.Specialty || "N/A",
          subSpecialty: item["Sub Speciality"] || "N/A",
          submittedOn: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB")
            : "N/A",
          status: item.status,
          statusColor: "bg-gray-200 text-gray-600",
          timeCount: item["like_count"] || 0,
          average_rating: item["average_rating"] || 0,
          taggingSampleDataset: item["Tagging to sample datasets"] || "",
          modelArchitecture:item["Model Architecture"] || "N/A",
          modelFramework:item["Model Framework"] || "N/A",

        }),
      );

      setProjectListData(formattedData || []);
      setProjectListPageInfo(response?.data);
    } catch (err) {
      console.error("Failed to fetch form data", err);
      setProjectListData([]);
    } finally {
      setLoading(false);
    }
  }, [queryStrings, appliedFilters, activeTab, statusMap, shouldApplyFilters]);

  // useEffect to fetch data when dependencies change
  useEffect(() => {
    fetchFormData();
  }, [activeTab, queryStrings, shouldApplyFilters, fetchFormData]);

  const allowedTabs = allowedRoles.includes(role?.name)
    ? tabs
    : tabs.filter((tab) => tab === "All Projects");

  const filteredProjects = projectListData.filter(
    (project) => project.modelName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    router.push("/project-dockets/create");
  };

  const handleFilterApply = (filters: { fields: string; value: string }[]) => {
    setAppliedFilters(filters);
    setQueryString(prev => ({ ...prev, page: 1 }));
    // Set flag to apply filters
    setShouldApplyFilters(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setQueryString(prev => ({ ...prev, page: 1 }));
    // Reset applied filters when changing tabs
    setShouldApplyFilters(false);
  };

  return (
    <>
      <div className="bg-white p-6 min-h-screen">
        <div className="flex justify-between items-center mb-4 gap-2">
   <h1 className="text-lg md:text-2xl font-bold  mb-2 whitespace-nowrap">Project Dockets</h1>

          
          {canCreate && (
            <CustomButton
              text="Create Dockets"
              onClick={handleCreateProject}
              isLoading={false}
              className="text-xs md:text-base"

            />
          )}
        </div>

        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          onFilterClick={() => setIsFilterOpen(true)}
          placeholder="Search by Project Name"
        />

        <div className="border-b border-[#dbdfe5] flex justify-evenly space-x-6 overflow-x-auto whitespace-nowrap text-lg scrollbar-hide px-2">
          {allowedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`py-2 px-4 font-bold font-[Open Sans] text-[17px] ${activeTab === tab
                  ? "border-b-4 border-orange-500 text-black"
                  : "text-500"
                }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-y-auto space-y-4" style={{ height: "34rem" }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.projectId}
                {...project}
                status={Number(project.status)} // Convert status to number
                role={role?.name}
                canUpdate={canUpdate}
                canRead={canRead}
                datasetApi={fetchFormData}
                taggingSampleDataset={project.taggingSampleDataset}
                modelArchitecture={project.modelArchitecture}
                modelFramework={project.modelFramework}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No projects found.
            </p>
          )}
        </div>

        <FilterSidebar
          type={3}
          open={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onFilterApply={handleFilterApply}
          initialFilters={appliedFilters}
        />

        {!loading && projectListData.length > 0 && (
          <TablePagination
            queryStrings={queryStrings}
            setQueryString={setQueryString}
            paging={projectListPageInfo?.pagingInfo || { total_page: 0, current_page: 0, item_per_page: 0, total_items: 0 }}
          />
        )}
      </div>
    </>
  );
};

export default ProjectDocketsPage;
