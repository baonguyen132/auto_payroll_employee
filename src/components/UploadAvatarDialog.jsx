import { useState } from "react";
import { API_BASE_URL } from "../services/api";

export default function UploadAvatarDialog({ isOpen, onClose, userCode, handleChangeAvatar }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Vui lòng chọn ảnh!");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API_BASE_URL}/employee/${userCode}/avatar`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Upload thành công!");
        console.log("CID:", data.cid);
        console.log("URL:", data.url);
        handleChangeAvatar(data.url);
        onClose();
      } else {
        alert("Upload thất bại: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối API");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Ảnh Đại Diện</h2>

        {/* Preview */}
        <div className="flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover shadow-md mb-4"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-500">Chưa có ảnh</span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>

          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
