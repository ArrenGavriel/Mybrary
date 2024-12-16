
// Import FilePond and its plugins
import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css'; // Import CSS
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'; // Import plugin CSS
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';

// Register the plugins with FilePond
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
);

// Ensure the DOM is fully loaded before initializing FilePond
document.addEventListener('DOMContentLoaded', function() {
    const inputElements = document.querySelectorAll('input.filepond'); // Select all file input elements with class 'filepond'
    
    // Create FilePond instances
    FilePond.create(inputElements, {
        allowMultiple: true, // Allow multiple file uploads
        maxFiles: 10, // Maximum number of files allowed
        maxFileSize: '3MB', // Maximum file size allowed
        imageResizeTargetWidth: 200, // Target width for resized images
        imageResizeTargetHeight: 200, // Target height for resized images
        server: {
            url: '/filepond/api', // URL for the server-side processing endpoint
            process: '/filepond/process', // URL for file processing
            revert: '/filepond/revert', // URL for reverting the upload
            headers: {
                'Upload-Name': (file) => file.name, // Custom header for upload name
                'X-CSRF-TOKEN': 'your-csrf-token-here' // CSRF token for security
            }
        }
    });

    console.log('FilePond instance created');
});
