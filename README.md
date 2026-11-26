# TaskFlow — Task Management System

TaskFlow is a responsive, browser-based task management dashboard built as a beginner-friendly portfolio project. It helps users organize work, personal activities, and study tasks in one place.

## Project goals

- Demonstrate practical frontend development with semantic HTML, responsive CSS, and vanilla JavaScript.
- Practice CRUD operations, filtering, sorting, form validation, and browser storage.
- Provide a clean SaaS-style interface that can be hosted as a static website.

## Features

- Dashboard statistics for total, to-do, in-progress, and completed tasks.
- Dynamic completion visualization and category breakdown.
- Create, view, edit, delete, and update task status.
- Categories: Work, Personal, Study, and Other.
- Priorities: Low, Medium, and High.
- Statuses: To Do, In Progress, and Completed.
- Search by task name or description.
- Filter by category, priority, and status.
- Sort by deadline or creation date.
- Persistent task and profile data using `localStorage`.
- Sample tasks on the first visit.
- Delete-all confirmation and success/error notifications.
- Responsive sidebar and layouts for desktop, tablet, and mobile.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Browser LocalStorage
- Git and GitHub
- GitHub Pages

No backend, database, package manager, framework, or build process is required.

## Folder structure

```text
TaskFlow/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   └── images/
└── README.md
```

## Run locally

1. Download or clone this repository.
2. Open the `TaskFlow` folder.
3. Double-click `index.html`, or use a simple editor preview / Live Server extension.
4. Start adding tasks. Data is stored in the current browser profile.

> The app uses relative paths, so it can run from a local folder or a GitHub Pages project URL.

## Deploy to GitHub Pages

1. Create a new repository on GitHub, for example `taskflow`.
2. Upload the contents of this project so that `index.html` is in the repository root.
3. Commit and push to the `main` branch.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then click **Save**.
7. Wait for GitHub Pages to publish the site. The URL will look like:
   `https://YOUR-USERNAME.github.io/taskflow/`

If the repository is named `YOUR-USERNAME.github.io`, the site is usually published at the root URL:
`https://YOUR-USERNAME.github.io/`

## Data and privacy

Tasks and the display name are saved locally in the browser with these keys:

- `taskflow.tasks.v1`
- `taskflow.profile.v1`

The app does not send task data to a server. Data is specific to the browser and device where it was created. Clearing browser storage can remove saved tasks.

## Screenshots

Add screenshots after running the application and place them in `assets/images/`. Then update this section, for example:

```markdown
![TaskFlow dashboard](assets/images/dashboard.png)
![TaskFlow task management](assets/images/tasks.png)
```

## Portfolio notes

Before submitting this project as a portfolio, consider adding:
- Real screenshots in the README.
- A short project case study describing the problem, solution, and technical decisions.
- A GitHub repository description and a live GitHub Pages URL.
- A short demo video or GIF showing task creation, editing, filtering, and persistence.

---

Built with focus using HTML, CSS, and JavaScript.
