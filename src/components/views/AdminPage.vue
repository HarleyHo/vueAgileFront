<template>
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
            <input v-if="editMemberIndex === index" v-model="member.userRole" />
            <span v-else>{{ member.userRole }}</span>
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
          <th>Manager</th>
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
          <td>
            <input v-if="editInformationIndex === index" v-model="information.projectManager" />
            <span v-else>{{ information.projectManager }}</span>
          </td>
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
            <input v-if="editInformationIndex === index" v-model="information.projectStatus" />
            <span v-else>{{ information.projectStatus }}</span>
          </td>
          <td>
            <button @click="editInformation(index)" >{{ editInformationIndex === index ? 'Save' : 'Modify' }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  //name: "Project Members",
  data() {
    return {
      //users:[{
      //  userId:'',
      //  userName:'',
      //  userEmail:'',
      //  userRole:'',
      //}],
      users:[{ userId: 1, userName: "Alice", userNickname: "A", userEmail: "alice@example.com", userRole: "Admin" },
             { userId: 2, userName: "Bob", userNickname: "B", userEmail: "bob@example.com", userRole: "User" },
             { userId: 3, userName: "Charlie", userNickname: "C", userEmail: "charlie@example.com", userRole: "Admin" }],
      //projects:[{
      //  projectId:'',
      //  projectName:'',
      //  projectManager:'',
      //  projectDesc:'',
      //  projectStartTime:'',
      //  projectEndTime:'',
      //  projectStatus:'',
      //}],
      projects:[{ projectId: 1, projectName: "Project A", projectManager: "A", projectDesc: "Description A", projectStartTime: "2023-01-01", projectEndTime: "2023-12-31", projectStatus: 1 }, 
                  { projectId: 2, projectName: "Project B", projectManager: "B", projectDesc: "Description B", projectStartTime: "2023-02-01", projectEndTime: "2023-11-30", projectStatus: 2 }, 
                  { projectId: 3, projectName: "Project C", projectManager: "C", projectDesc: "Description C", projectStartTime: "2023-03-01", projectEndTime: "2023-10-31", projectStatus: 3 } 
               ],
      editMemberIndex: null,
      editInformationIndex: null
      
    };
  },

  methods: {
    editMember(index) {
      if (this.editMemberIndex === index) {
        // Save the changes.
        this.editMemberIndex = null;
      } else {
        // Set the edit index to the clicked row.
        this.editMemberIndex = index;
      }
    },

    editInformation(index) {
      if (this.editInformationIndex === index) {
        // Save the changes.
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

