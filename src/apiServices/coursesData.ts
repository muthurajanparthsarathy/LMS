import axios from "axios";

const modelMap = {
  module: { path: "modules" },
  submodule: { path: "submodules" },
  topic: { path: "topics" },
  subtopic: { path: "subtopics" },
};

const BASE_URL = "http://localhost:5533";

export const entityApi = {
  updateEntity: async (
    entityType: "module" | "submodule" | "topic" | "subtopic",
    entityId: string,
    formData: FormData
  ) => {
    const response = await axios.put(
      `${BASE_URL}/uploadResourses/${modelMap[entityType].path}/${entityId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 200000,
      }
    );
    return response.data;
  },

  createFolder: async (
    entityType: "module" | "submodule" | "topic" | "subtopic",
    entityId: string,
    folderData: {
      tabType: "I_Do" | "We_Do" | "You_Do";
      subcategory: string;
      folderName: string;
      folderPath: string;
      courses?: string;
      topicId?: string;
      index?: number;
      title?: string;
      description?: string;
      duration?: string;
      level?: string;
    }
  ) => {
    const formData = new FormData();
    
    // Add basic entity data
    if (folderData.courses) formData.append("courses", folderData.courses);
    if (folderData.topicId) formData.append("topicId", folderData.topicId);
    if (folderData.index !== undefined) formData.append("index", folderData.index.toString());
    if (folderData.title) formData.append("title", folderData.title);
    if (folderData.description) formData.append("description", folderData.description);
    if (folderData.duration) formData.append("duration", folderData.duration);
    if (folderData.level) formData.append("level", folderData.level);
    
    // Add folder-specific data
    formData.append("tabType", folderData.tabType);
    formData.append("subcategory", folderData.subcategory);
    formData.append("folderName", folderData.folderName);
    formData.append("folderPath", folderData.folderPath);
    formData.append("action", "createFolder");
    
    const response = await axios.put(
      `${BASE_URL}/uploadResourses/${modelMap[entityType].path}/${entityId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    return response.data;
  },

updateFolder: async (
  entityType: "module" | "submodule" | "topic" | "subtopic",
  entityId: string,
  folderData: {
    tabType: "I_Do" | "We_Do" | "You_Do";
    subcategory: string;
    folderName: string;
    folderPath: string;
    courses?: string;
    topicId?: string;
    index?: number;
    title?: string;
    description?: string;
    duration?: string;
    level?: string;
    originalFolderName?: string; // Add this
  }
) => {
  const formData = new FormData();
  
  // Add basic entity data
  if (folderData.courses) formData.append("courses", folderData.courses);
  if (folderData.topicId) formData.append("topicId", folderData.topicId);
  if (folderData.index !== undefined) formData.append("index", folderData.index.toString());
  if (folderData.title) formData.append("title", folderData.title);
  if (folderData.description) formData.append("description", folderData.description);
  if (folderData.duration) formData.append("duration", folderData.duration);
  if (folderData.level) formData.append("level", folderData.level);
  
  // Add folder-specific data
  formData.append("tabType", folderData.tabType);
  formData.append("subcategory", folderData.subcategory);
  formData.append("folderName", folderData.folderName);
  formData.append("folderPath", folderData.folderPath);
  formData.append("action", "updateFolder");
  
  // ✅ CRITICAL: Add the original folder name
  if (folderData.originalFolderName) {
    formData.append("originalFolderName", folderData.originalFolderName);
  }
  
  const response = await axios.put(
    `${BASE_URL}/uploadResourses/${modelMap[entityType].path}/${entityId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  
  return response.data;
},

  deleteFolder: async (
    entityType: "module" | "submodule" | "topic" | "subtopic",
    entityId: string,
    folderData: {
      tabType: "I_Do" | "We_Do" | "You_Do";
      subcategory: string;
      folderName: string;
      folderPath: string;
      courses?: string;
      topicId?: string;
      index?: number;
      title?: string;
      description?: string;
      duration?: string;
      level?: string;
    }
  ) => {
    const formData = new FormData();
    
    // Add basic entity data
    if (folderData.courses) formData.append("courses", folderData.courses);
    if (folderData.topicId) formData.append("topicId", folderData.topicId);
    if (folderData.index !== undefined) formData.append("index", folderData.index.toString());
    if (folderData.title) formData.append("title", folderData.title);
    if (folderData.description) formData.append("description", folderData.description);
    if (folderData.duration) formData.append("duration", folderData.duration);
    if (folderData.level) formData.append("level", folderData.level);
    
    // Add folder-specific data
    formData.append("tabType", folderData.tabType);
    formData.append("subcategory", folderData.subcategory);
    formData.append("folderName", folderData.folderName);
    formData.append("folderPath", folderData.folderPath);
    formData.append("action", "deleteFolder");
    
    const response = await axios.put(
      `${BASE_URL}/uploadResourses/${modelMap[entityType].path}/${entityId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    return response.data;
  },
  // Add to entityApi object
deleteFile: async (
  entityType: "module" | "submodule" | "topic" | "subtopic",
  entityId: string,
  fileData: {
    tabType: "I_Do" | "We_Do" | "You_Do";
    subcategory: string;
    folderPath: string;
    courses?: string;
    topicId?: string;
    index?: number;
    title?: string;
    description?: string;
    duration?: string;
    level?: string;
    action: string;
    updateFileId: string;
  }
) => {
  const formData = new FormData();
  
  // Add basic entity data
  if (fileData.courses) formData.append("courses", fileData.courses);
  if (fileData.topicId) formData.append("topicId", fileData.topicId);
  if (fileData.index !== undefined) formData.append("index", fileData.index.toString());
  if (fileData.title) formData.append("title", fileData.title);
  if (fileData.description) formData.append("description", fileData.description);
  if (fileData.duration) formData.append("duration", fileData.duration);
  if (fileData.level) formData.append("level", fileData.level);
  
  // Add file deletion data
  formData.append("tabType", fileData.tabType);
  formData.append("subcategory", fileData.subcategory);
  formData.append("folderPath", fileData.folderPath);
  formData.append("action", fileData.action);
  formData.append("updateFileId", fileData.updateFileId);
  
  const response = await axios.put(
    `${BASE_URL}/uploadResourses/${modelMap[entityType].path}/${entityId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  
  return response.data;
},
};

// Export types
export type CourseStructureData = {
  _id: string;
  courseName: string;
  courseDescription: string;
  I_Do: string[];
  We_Do: string[];
  You_Do: string[];
  resourcesType: string[];
  modules: Module[];
};

export type Module = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  index: number;
  level: string;
  topics: Topic[];
  subModules: SubModule[];
  pedagogy?: any;
};

export type SubModule = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  index: number;
  level: string;
  topics: Topic[];
  pedagogy?: any;
};

export type Topic = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  index: number;
  level: string;
  subTopics: SubTopic[];
  pedagogy?: any;
};

export type SubTopic = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  index: number;
  level: string;
  pedagogy?: any;
};

export const courseDataApi = {
  getById: (id: string) => ({
    queryKey: ["course", id],
    queryFn: async (): Promise<{ data: CourseStructureData }> => {
      const response = await axios.get(`${BASE_URL}/getAll/courses-data/${id}`);
      return response.data;
    },
  }),
};