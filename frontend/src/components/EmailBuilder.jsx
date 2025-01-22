import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  LinkIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline' 
import { toast } from 'react-hot-toast'
// import { uploadImage} from '../utils/cloudinary'
import axios from 'axios'

function EmailBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [activeSection, setActiveSection] = useState("title") // 'title', 'content', 'footer'
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const textareaRef = useRef(null)
  const [displayText, setDisplayText] = useState('') // New state for clean text display
  const [initialColor, setInitialColor] = useState(null);
  const [variableColor, setVariableColor] = useState('#000000');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const response = await axiosInstance.get(`/templates/${id}`);
        if (!response.status === 200) throw new Error('Failed to fetch template');
        setTemplate(response.data.template);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    fetchTemplate();
  }, [id]);

  useEffect(() => {
    if (activeSection && template && !initialColor) {
      setInitialColor(template[activeSection].textColor);
    }
  }, [activeSection, template]);

  // function handleSaveTemplate(e) {
  //   e.preventDefault();
  //   console.log('Saving template...');
  //   console.log({template});

  // }
  // Update displayText when section changes
  useEffect(() => {
    if (activeSection && template) {
      const cleanText = stripHtmlTags(template[activeSection].value);
      setDisplayText(cleanText);
    }
  }, [activeSection, template]);

  // Function to strip HTML tags and convert <br> to newlines
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '');
  };

  // Function to apply formatting
  const applyTextFormat = (format) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (start === end && format !== 'link') return; // No text selected

    let formattedHtml = template[activeSection].value;
    const plainText = displayText;
    
    // Find the corresponding position in the HTML
    const beforeSelection = plainText.substring(0, start);
    const beforeHtmlLength = stripHtmlTags(formattedHtml.substring(0, formattedHtml.length)).length;
    
    let htmlStart = 0;
    let htmlEnd = formattedHtml.length;
    
    // Find the correct position in HTML
    for (let i = 0; i < formattedHtml.length; i++) {
      const currentPlainText = stripHtmlTags(formattedHtml.substring(0, i));
      if (currentPlainText.length === start) {
        htmlStart = i;
      }
      if (currentPlainText.length === end) {
        htmlEnd = i;
        break;
      }
    }

    // Apply the formatting
    const prefix = formattedHtml.substring(0, htmlStart);
    const content = formattedHtml.substring(htmlStart, htmlEnd);
    const suffix = formattedHtml.substring(htmlEnd);

    let newHtml = '';
    switch (format) {
      case 'bold':
        newHtml = `${prefix}<b>${content}</b>${suffix}`;
        break;
      case 'italic':
        newHtml = `${prefix}<i>${content}</i>${suffix}`;
        break;
      case 'underline':
        newHtml = `${prefix}<u>${content}</u>${suffix}`;
        break;
      case 'link':
        if (linkUrl) {
          newHtml = `${prefix}<a href="${linkUrl}" target="__blank">${content}</a>${suffix}`;
          setShowLinkInput(false);
          setLinkUrl('');
        } else {
          setShowLinkInput(true);
          return;
        }
        break;
      default:
        return;
    }

    // Update template with formatted HTML
    setTemplate(prev => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        value: newHtml
      }
    }));

    // Keep cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = end;
    }, 0);
  };

  // Handle text changes in textarea
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setDisplayText(newText);
    
    // Convert newlines to <br> tags and update template
    const htmlText = newText.replace(/\n/g, '<br>');
    setTemplate(prev => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        value: htmlText
      }
    }));
  };

  // Function to render HTML content safely
  const renderFormattedContent = (content) => {
    return { __html: content };
  };

  // Get clean text for textarea
  const getActiveSectionData = () => {
    if (!activeSection || !template) return null;
    return {
      ...template[activeSection],
      value: displayText // Use clean text for display
    };
  };

  // Handle color change
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setVariableColor(newColor);
    setTemplate(prev => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        textColor: newColor
      }
    }));
  };

  // Handle logo file selection
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setTemplate(prev => ({
          ...prev,
          logoUrl: reader.result // Store base64 in template state
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    console.log({template});
    console.log('Saving template...');
    
    try {
      // Send the entire template object to backend
      const response = await axiosInstance.put(`/templates/uploadEmailConfig/${id}`, template);
      
      if (response.data.template) {
        // Update local template with the saved version (including new logo URL)
        setTemplate(response.data.template);
        toast.success('Template saved successfully');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Add download function
  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/templates/renderAndDownloadTemplate/${id}/download`, {
        responseType: 'blob' // Important for handling the HTML file
      });
      
      // Create a blob from the HTML content
      const blob = new Blob([response.data], { type: 'text/html' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.templateName || 'email-template'}.html`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  console.log({template});

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Main Preview Area */}
      {template && (
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back
              </button>
            </div>
            
            <h2 className="text-xl font-semibold mt-4">{template.templateName}</h2>

            {/* Email Canvas */}
            <div className="bg-white mt-4 mx-auto max-w-3xl min-h-[600px] shadow-md p-8">
              {/* Logo Section */}
              <div 
                className={`cursor-pointer ${activeSection === 'logo' ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoSelect}
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="h-[200px] w-[200px] mx-auto object-contain" />
                  ) : template.logoUrl ? (
                    <img src={template.logoUrl} alt="Logo" className="h-[200px] w-[200px] mx-auto object-contain" />
                  ) : (
                    'ADD LOGO'
                  )}
                </button>
              </div>

              {/* Title Section */}
              <div 
                className={`mt-8 px-1 py-3 cursor-pointer ${activeSection === 'title' ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setActiveSection('title')}
              >
                <h1 
                  className="text-3xl font-bold mb-4"
                  style={{
                    color: template.title.textColor,
                    fontSize: template.title.fontSize === 'sm' ? '1.5rem' : template.title.fontSize === 'md' ? '2rem' : '2.5rem',
                    textAlign: template.title.alignment
                  }}
                  dangerouslySetInnerHTML={renderFormattedContent(template.title.value)}
                />
              </div>

              {/* Content Section */}
              <div 
                className={`mt-6 px-1 py-3 cursor-pointer ${activeSection === 'context' ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setActiveSection('context')}
              >
                <div
                  style={{
                    color: template.context.textColor,
                    fontSize: template.context.fontSize === 'sm' ? '0.875rem' : template.context.fontSize === 'md' ? '1rem' : '1.125rem',
                    textAlign: template.context.alignment
                  }}
                  dangerouslySetInnerHTML={renderFormattedContent(template.context.value)}
                />
                {template.imageUrl?.map((url, index) => (
                  <img key={index} src={url} alt={`Content ${index + 1}`} className="my-4 w-full" />
                ))}
              </div>

              {/* Footer Section */}
              <div 
                className={`mt-8 px-1 py-3 border-t cursor-pointer ${activeSection === 'footer' ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setActiveSection('footer')}
              >
                <div
                  style={{
                    color: template.footer.textColor,
                    fontSize: template.footer.fontSize === 'sm' ? '0.875rem' : template.footer.fontSize === 'md' ? '1rem' : '1.125rem',
                    textAlign: template.footer.alignment
                  }}
                  dangerouslySetInnerHTML={renderFormattedContent(template.footer.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      {template && activeSection && (
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            {/* Text Editor Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Text</h3>
                
                {/* Rich Text Editor Controls */}
                <div className="flex space-x-1 mb-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => applyTextFormat('bold')}
                  >
                    <BoldIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => applyTextFormat('italic')}
                  >
                    <ItalicIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => applyTextFormat('underline')}
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => applyTextFormat('link')}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Link Input Dialog */}
                {showLinkInput && (
                  <div className="mb-2">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Press Enter to add link or Escape to cancel"
                      className="w-full p-2 border rounded text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          applyTextFormat('link');
                        } else if (e.key === 'Escape') {
                          setShowLinkInput(false);
                          setLinkUrl('');
                        }
                      }}
                    />
                  </div>
                )}

                {/* Text Input */}
                <div className="text-xs text-gray-500 mt-1">
                  Select the text to format
                </div>
                <textarea
                  ref={textareaRef}
                  className="w-full border rounded-md p-3 min-h-[100px] text-sm resize-y whitespace-pre-wrap break-words"
                  value={getActiveSectionData()?.value || ''}
                  onChange={handleTextChange}
                  placeholder={`Enter ${activeSection} text`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Shift + Enter will add a line break
                </div>
              </div>

              {/* Alignment */}
              <div>
                <h3 className="font-medium mb-2 text-sm">Alignment</h3>
                <div className="flex space-x-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => setTemplate(prev => ({
                        ...prev,
                        [activeSection]: {
                          ...prev[activeSection],
                          alignment: align
                        }
                      }))}
                      className={`flex-1 p-2 border rounded ${
                        getActiveSectionData()?.alignment === align 
                          ? 'bg-gray-100' 
                          : ''
                      }`}
                    >
                      {align === 'left' && <Bars3BottomLeftIcon className="w-4 h-4 mx-auto" />}
                      {align === 'center' && <Bars3Icon className="w-4 h-4 mx-auto" />}
                      {align === 'right' && <Bars3BottomRightIcon className="w-4 h-4 mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <h3 className="font-medium mb-2 text-sm">Text color</h3>
                <div className="flex space-x-2">
                  {/* Fixed Color from Backend */}
                  <button
                    onClick={() => {
                      setTemplate(prev => ({
                        ...prev,
                        [activeSection]: {
                          ...prev[activeSection],
                          textColor: initialColor
                        }
                      }));
                    }}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-300"
                    style={{ backgroundColor: initialColor }}
                    title="Click to use original color"
                  />
                  
                  {/* Color Picker Input */}
                  <input
                    type="color"
                    value={variableColor}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded-full cursor-pointer"
                    title="Choose new color"
                  />
                </div>
              </div>

              {/* Font Size */}
              <div>
                <h3 className="font-medium mb-2 text-sm">Font size</h3>
                <div className="flex flex-wrap gap-2">
                  {['SM', 'MD', 'LG'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTemplate(prev => ({
                        ...prev,
                        [activeSection]: {
                          ...prev[activeSection],
                          fontSize: size.toLowerCase()
                        }
                      }))}
                      className={`px-3 py-1 text-sm border rounded ${
                        getActiveSectionData()?.fontSize === size.toLowerCase() 
                          ? 'bg-gray-100 border-gray-400' 
                          : 'border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleSaveTemplate}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Save Template
                </button>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Download HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailBuilder