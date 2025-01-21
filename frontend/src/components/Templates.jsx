import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/templates/user');
      console.log({response});
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await axios.post('/templates/create', {
        templateName: 'New Template'
      });
      // Store the template data in localStorage for EmailBuilder
      localStorage.setItem('currentTemplate', JSON.stringify(response.data));
      
      // Navigate to the builder with the new template ID
      navigate(`/builder/${response.data.template._id}`);
      toast.success('Template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create new template');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Templates</h1>
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Template
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No templates yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {template.templateName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => navigate(`/builder/${template._id}`)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/preview/${template._id}`)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-green-600 hover:text-green-700"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Templates; 