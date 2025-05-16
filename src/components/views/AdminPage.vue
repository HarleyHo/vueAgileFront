<template>
  <div v-if="isAdmin">
    <div>
      <h1>Members</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Nickname</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(member, index) in users" :key="member.userId">
            <td>{{ member.userId }}</td>
            <td>
              <input v-if="editMemberIndex === index" v-model="member.userName" />
              <span v-else>{{ member.userName }}</span>
            </td>
            <td>
              <input v-if="editMemberIndex === index" v-model="member.userNickname" />
              <span v-else>{{ member.userNickname }}</span>
            </td>
            <td>
              <input v-if="editMemberIndex === index" v-model="member.userEmail" />
              <span v-else>{{ member.userEmail }}</span>
            </td>
            <td>
              <select v-if="editMemberIndex === index" v-model="member.userRole">
              <option value="0">普通用户</option>
              <option value="1">管理员</option>
              </select>
              <span v-else>{{ member.userRole === 1 ? '管理员' : '普通用户' }}</span>
            </td>
            <td>
              <button @click="editMember(index)" >{{ editMemberIndex === index ? 'Save' : 'Modify' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h1>Project</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <!-- <th>Manager</th> -->
            <th>Description</th>
            <th>StartTime</th>
            <th>EndTime</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(information, index) in projects" :key="information.projectId">
            <td>{{ information.projectId }}</td>
            <td>
              <input v-if="editInformationIndex === index" v-model="information.projectName" />
              <span v-else>{{ information.projectName }}</span>
            </td>
            <!-- <td>
              <input v-if="editInformationIndex === index" v-model="information.projectManager" />
              <span v-else>{{ information.projectManager }}</span>
            </td> -->
            <td>
              <input v-if="editInformationIndex === index" v-model="information.projectDesc" />
              <span v-else>{{ information.projectDesc }}</span>
            </td>
            <td>
              <input v-if="editInformationIndex === index" v-model="information.projectStartTime" />
              <span v-else>{{ information.projectStartTime }}</span>
            </td>
            <td>
              <input v-if="editInformationIndex === index" v-model="information.projectEndTime" />
              <span v-else>{{ information.projectEndTime }}</span>
            </td>
            <td>
                <select v-if="editInformationIndex === index" v-model="information.projectStatus">
                <option value="0">未开始</option>
                <option value="1">进行中</option>
                <option value="2">已完成</option>
                </select>
                <span v-else>
                {{ information.projectStatus == 0 ? '未开始' : information.projectStatus == 1 ? '进行中' : '已完成' }}
                </span>
            </td>
            <td>
              <button @click="editInformation(index)" >{{ editInformationIndex === index ? 'Save' : 'Modify' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else>
    <p>No permission to view this content.</p>
  </div>
</template>

<script>
import axios from "@/axios.js";

export default {
  data() {
    return {
      users: [],
      projects: [],
      editMemberIndex: null,
      editInformationIndex: null,
      isAdmin: localStorage.getItem("userRole") === "1" ? true : false,
    };
  },
  created() {
    this.fetchProjects();
    this.fetchUsers(1, 10);
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await axios.get('/project', {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        if (response.data.state === 200) {
          this.projects = response.data.data.projects;
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },
    async fetchUsers(pageNum, pageSize) {
      try {
        const response = await axios.post('/user/getAll', null, {
          params: {
            pageNum: pageNum,
            pageSize: pageSize,
          },
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        if (response.data.state === 200) {
          this.users = response.data.data.records;
          this.isAdmin = this.users.some(user => user.userRole === 1);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async editMember(index) {
      if (this.editMemberIndex === index) {
        // Save the changes.
        try {
          const response = await axios.put('/user', {
            userId: this.users[index].userId,
            userName: this.users[index].userName,
            userNickname: this.users[index].userNickname,
            userEmail: this.users[index].userEmail,
            userRole: this.users[index].userRole,
          }, {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          });
          if (response.data.state === 200) {
            console.log(response.data.msg);
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
        this.editMemberIndex = null;
      } else {
        // Set the edit index to the clicked row.
        this.editMemberIndex = index;
      }
    },
    async editInformation(index) {
      if (this.editInformationIndex === index) {
        // Save the changes.
        try {
          const response = await axios.put(`/project/${this.projects[index].projectId}`, {
            projectId: this.projects[index].projectId,
            projectName: this.projects[index].projectName,
            projectPmId: 1, // Assuming project manager ID is 1 for now
            projectDesc: this.projects[index].projectDesc,
            projectStartTime: this.projects[index].projectStartTime,
            projectEndTime: this.projects[index].projectEndTime,
            projectStatus: this.projects[index].projectStatus,
          }, {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          });
          if (response.data.state === 200) {
            console.log(response.data.msg);
          }
        } catch (error) {
          console.error('Error updating project:', error);
        }
        this.editInformationIndex = null;
      } else {
        // Set the edit index to the clicked row.
        this.editInformationIndex = index;
      }
    },
  },
};
</script>

<style scoped>
/*Setting Style.*/
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #f8f8f8;
}
/*Form hover styles.*/
tr:hover {
  background-color: #e0f8e4;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
/*Color of header.*/
th {
  background-color: #f2f2f2;
}
button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
input {
  width: 100%;
  box-sizing: border-box;
}
</style>
