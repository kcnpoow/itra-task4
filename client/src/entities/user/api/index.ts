import type { User } from "../model";
import { api } from "@/shared/api";

class UserApi {
  async getUsers(): Promise<User[]> {
    const response = await api.get("/users");

    return response.data;
  }

  async blockUsersByIds(userIds: number[]) {
    const url = `/users/block?ids=${userIds.join(",")}`;

    const response = await api.patch(url);

    return response.data;
  }

  async unblockUsersByIds(userIds: number[]) {
    const url = `/users/unblock?ids=${userIds.join(",")}`;

    const response = await api.patch(url);

    return response.data;
  }

  async deleteUsersByIds(userIds: number[]) {
    const url = `/users?ids=${userIds.join(",")}`;

    const response = await api.delete(url);

    return response.data;
  }

  async deleteUnverifiedUsers() {
    const response = await api.delete("/users/unverified");

    return response.data;
  }
}

export const userApi = new UserApi();
