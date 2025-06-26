export const getAuditLogList = async (param1, param2, param3, param4,param) => {
    const response = await requestMgmApi.get(`/audit-logs/get?role=${param1}&org_id=${param2}&page=${param3}&limit=${param4}&username=${param}`);
    return response;
};
export const getAuditLogSearch = async (param) => {
    const response = await requestMgmApi.get(`/audit-logs/findlogs?username=${param}`);
    return response;
};
