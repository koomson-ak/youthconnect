# YouthConnect

A simple and efficient attendance app designed for in-person youth meetings.

## Key Features & Benefits

-   **Easy Attendance Tracking:** Streamline the process of recording attendance for meetings.
-   **Intuitive Interface:** A user-friendly interface for quick and easy data entry.
-   **React-based Components:** Utilizes reusable components for maintainability and scalability.
-   **TypeScript Support:** Enhanced code quality and maintainability through static typing.
-   **Supabase Integration:** Uses Supabase as a backend for managing data.
-   **Tailwind CSS:** Styles are defined using Tailwind CSS, providing a modern and responsive design.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

-   **Node.js:**  (Version specified in `package.json` should be compatible)
-   **npm:** (Node Package Manager) or **bun:** (Bun Package Manager)

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/koomson-ak/youthconnect.git
    cd youthconnect
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    or, using Bun:

    ```bash
    bun install
    ```

3.  **Configuration:**

    -   Create a `.env` file based on `.env.example`.
    -   Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables. These values should be obtained from your Supabase project settings.

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Start the development server:**

    Using npm:

    ```bash
    npm run dev
    ```

    or, using Bun (if configured correctly):

    ```bash
    bun run dev
    ```

    This will start the application, typically accessible at `http://localhost:5173`.

## Usage Examples & API Documentation

-   The application consists of components such as `AttendanceControls` and `AttendanceForm` which manage attendance data.
-   Refer to the source code in `src/components` for detailed usage of these components.
-   Supabase API is used for database interactions. Consult Supabase documentation for specific API usage.

## Configuration Options

-   **`.env` file:** Configuration via environment variables is supported.
    -   `VITE_SUPABASE_URL`: The URL of your Supabase project.
    -   `VITE_SUPABASE_ANON_KEY`: The public API key for your Supabase project.

## Contributing Guidelines

We welcome contributions! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

Please ensure your code adheres to the linting rules defined in `.eslintrc.cjs`.

## License Information

License not specified. All rights reserved.

## Acknowledgments

-   This project utilizes various open-source libraries and frameworks, including:
    -   React
    -   TypeScript
    -   Tailwind CSS
    -   Vite
    -   Supabase
    -   Radix UI
    -   Zod
    -   React Hook Form