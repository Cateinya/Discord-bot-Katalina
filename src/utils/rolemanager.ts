import { roles } from "./dataobject";

export function getServerRolesList(server_id: string) {
    return roles.get(server_id)?.sort();
}

export function addServerRole(server_id: string, role: string) {
    const serverRolesList = roles.get(server_id);
    if (!serverRolesList) {
        const newServerList: string[] = [role];
        // Save modification
        roles.set(server_id, newServerList);
    } else {
        serverRolesList.push(role);
        serverRolesList.sort();
        // Save modification
        roles.save();
    }
}

export function deleteServerRole(server_id: string, role: string) {
    const serverRolesList = roles.get(server_id);
    if (serverRolesList && !(serverRolesList.indexOf(role) == -1)) {
        serverRolesList.splice(serverRolesList.indexOf(role), 1);
        // Save modification
        roles.save();
    }
}