import {fetchWithAuth} from "~/server/utils/api";

export default {
    getUser(userEmail: string) {
        return fetchWithAuth(`/api/get-user?email=${userEmail}`);
    }
};
