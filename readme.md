# Technical Report: Freelancer Pricing Calculator

## Introduction
This technical report describes the implementation of a Freelancer Pricing Calculator, a web application that allows users to calculate and visualize costs and values related to freelance projects. The application was developed using HTML, CSS, and JavaScript, and includes CRUD (Create, Read, Update, Delete) functionalities to manage fixed costs, variable costs, and working hours.

## Technologies Used

### 1. **HTML (HyperText Markup Language)**
- **Description**: Markup language used to structure the content of the web application.
- **Usage**: Defines the structure of the page, including input fields, buttons, and sections for displaying results.

### 2. **CSS (Cascading Style Sheets)**
- **Description**: Style sheet language used for describing the presentation of the HTML document.
- **Usage**: Styles the HTML elements, ensuring a visually appealing and responsive layout. Includes techniques for sticky headers and scrollable content without visible scrollbars.

### 3. **JavaScript**
- **Description**: Programming language used to add interactivity and dynamic behavior to the web application.
- **Usage**: Implements the CRUD functionalities, calculations, and detailed reporting. Includes event handling for form submissions and button clicks.

## Implementation Techniques

### 1. **CRUD Functionalities**
- **Create**: Functions to add new fixed costs, variable costs, and working hours, including descriptions.
- **Read**: Functions to display the lists of fixed costs, variable costs, and working hours.
- **Update**: Functions to edit existing fixed costs, variable costs, and working hours.
- **Delete**: Functions to remove existing fixed costs, variable costs, and working hours.

### 2. **Calculation and Reporting**
- **Calculation**: Functions to calculate the hourly rate, total monthly costs, and total project costs based on user inputs.
- **Reporting**: Detailed report generation that includes total fixed costs, net salary goal, salary with taxes, total variable costs, total working hours, effective working hours with a 20% margin for delays, hourly rate, total monthly costs, and total project costs.

### 3. **Sticky Headers**
- **Technique**: Uses CSS `position: sticky` to keep the main title (`<h1>`) and section titles (`<h2>`) visible at the top of the page when scrolling.

### 4. **Scrollable Content without Visible Scrollbars**
- **Technique**: Uses CSS `overflow-y: scroll` to enable vertical scrolling and hides the scrollbar using `scrollbar-width: none` for Firefox, `-ms-overflow-style: none` for Internet Explorer and Edge, and `::-webkit-scrollbar { display: none; }` for WebKit-based browsers (Chrome, Safari, etc.).

## Use Cases

### 1. **Adding Fixed Costs**
- **Description**: User adds a new fixed cost with a description and value.
- **Implementation**: Click the "Add" button in the "Fixed Costs" section. The new cost is added to the list and displayed.

### 2. **Editing Fixed Costs**
- **Description**: User edits an existing fixed cost.
- **Implementation**: Click the "Edit" button in the "Fixed Costs" section. A prompt asks for the index of the cost to edit and the new value.

### 3. **Deleting Fixed Costs**
- **Description**: User deletes an existing fixed cost.
- **Implementation**: Click the "Delete" button in the "Fixed Costs" section. A prompt asks for the index of the cost to delete.

### 4. **Adding Variable Costs**
- **Description**: User adds a new variable cost with a description and value.
- **Implementation**: Click the "Add" button in the "Variable Costs" section. The new cost is added to the list and displayed.

### 5. **Editing Variable Costs**
- **Description**: User edits an existing variable cost.
- **Implementation**: Click the "Edit" button in the "Variable Costs" section. A prompt asks for the index of the cost to edit and the new value.

### 6. **Deleting Variable Costs**
- **Description**: User deletes an existing variable cost.
- **Implementation**: Click the "Delete" button in the "Variable Costs" section. A prompt asks for the index of the cost to delete.

### 7. **Adding Working Hours**
- **Description**: User adds a new working hour with a description and value.
- **Implementation**: Click the "Add" button in the "Working Hours" section. The new hour is added to the list and displayed.

### 8. **Editing Working Hours**
- **Description**: User edits an existing working hour.
- **Implementation**: Click the "Edit" button in the "Working Hours" section. A prompt asks for the index of the hour to edit and the new value.

### 9. **Deleting Working Hours**
- **Description**: User deletes an existing working hour.
- **Implementation**: Click the "Delete" button in the "Working Hours" section. A prompt asks for the index of the hour to delete.

### 10. **Calculating and Viewing Results**
- **Description**: User inputs the net salary goal and clicks the "Calculate" button to view the detailed report.
- **Implementation**: Click the "Calculate" button in the "Salary Goal" section. The results are displayed, including the hourly rate, total monthly costs, total project costs, and a detailed report.

## Conclusion
The Freelancer Pricing Calculator provides a comprehensive tool for freelancers to manage and calculate project costs. By leveraging HTML, CSS, and JavaScript, the application offers a user-friendly interface with CRUD functionalities and detailed reporting. The use of sticky headers and hidden scrollbars enhances the user experience, ensuring that important information remains accessible and visually appealing.