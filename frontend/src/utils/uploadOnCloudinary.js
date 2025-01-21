import axios from "axios";

export const uploadOnCloudinary = async (file, type, folderName) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "hzflvwpi");
  formData.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${type}/upload`,
      formData,
      {
        resource_type: "auto",
        folder: `${folderName}`,
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    return {
      success: false,
      error: err.message || "Failed to upload file to Cloudinary"
    };
  }
};
