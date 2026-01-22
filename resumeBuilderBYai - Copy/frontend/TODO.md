# Frontend TODO List

## Project Setup
- [x] Evaluate if `pptxgenjs` is needed on the frontend or if generation is purely a backend process.
  - *Evaluation complete: Generation is handled by the backend. The frontend will receive a base64 string and trigger a download. `pptxgenjs` is not needed on the frontend.*

## UI/UX for Dual Functionality
 - [x] Create a landing page or selection screen for "Resume Builder" and "PPTX Builder".

## Authentication
- [x] Create login and registration pages/components.
- [x] Implement state management for user authentication (e.g., Context API).
- [x] Create protected routes for authenticated users.

## PPTX Builder Interface
- [x] Design and build the UI for creating presentations (e.g., input fields for title, content, number of slides).

## API Integration
## API Integration
- [x] Connect to backend endpoints for:
  - [x] Login/Registration.
  - [x] PPTX and Resume generation.
  - [x] Fetching user history.
  - [x] Submitting reviews.

## History Tab
- [x] Create a "History" tab/page to display a list of the user's previously generated PPTX files and resumes.

## Review Flow
- [x] Create a preview component for the generated content.
- [x] Implement a form or interactive element for users to provide feedback/reviews.
- [x] Handle the updated content after AI refinement.

## Download
- [x] Implement the download functionality for the final PPTX and resume files.