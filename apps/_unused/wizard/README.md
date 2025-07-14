# Bootstrap Wizard Form Requirements

## Overview
Create a JSON-driven wizard form using Bootstrap 5.3 with accordion navigation. The form allows free navigation between sections without forcing linear progression.

## Technical Specifications

### Framework Requirements
- **Bootstrap 5.3** form components and accordion
- **Dark mode** by default: `<html lang="en" data-bs-theme="dark">`
- **No custom CSS classes** - Bootstrap utility API only
- **Vanilla JavaScript** with MDN-style element creation (no helpers)

### Form Structure
- **JSON-driven** form configuration
- **Accordion panes** for form sections
- **Free navigation** between sections
- **No validation enforcement** during navigation

## JSON Configuration Format

### Field Object Structure
```json
{
  "name": "fieldName",
  "type": "text|email|password|number|tel|url|search|color|date|datetime-local|month|time|week|range|file|checkbox|radio|hidden",
  "label": "Display Label",
  "description": "Field description text",
  "value": "default value",
  "required": true|false,
  "placeholder": "placeholder text",
  "min": "minimum value",
  "max": "maximum value",
  "step": "step value",
  "multiple": true|false,
  "options": [
    {"value": "option1", "text": "Option 1"},
    {"value": "option2", "text": "Option 2"}
  ]
}
```

### Bootstrap-Specific Elements
```json
{
  "tagName": "div",
  "id": "elementId",
  "class": "form-text",
  "innerText": "Help text content"
}
```

### Accordion Structure
```javascript
form = [
  [
    // Pane 1 fields
    { "name": "field1", "type": "text", ... },
    { "name": "field2", "type": "email", ... }
  ],
  [
    // Pane 2 fields
    { "name": "field3", "type": "color", ... }
  ]
]
```

## Supported Form Elements

### Input Types
- **text** - Single line text input
- **email** - Email input with validation
- **password** - Password input (hidden text)
- **number** - Numeric input
- **tel** - Telephone number input
- **url** - URL input
- **search** - Search input
- **color** - Color picker
- **date** - Date picker
- **datetime-local** - Date and time picker
- **month** - Month picker
- **time** - Time picker
- **week** - Week picker
- **range** - Range slider
- **file** - File upload
- **checkbox** - Checkbox input
- **radio** - Radio button
- **hidden** - Hidden input

### Complex Elements
- **textarea** - Multi-line text input
- **select** - Dropdown selection
- **select multiple** - Multiple selection dropdown

## Bootstrap Form Classes Required

### Form Structure
- `form-control` - Standard form inputs
- `form-select` - Select dropdowns
- `form-check` - Checkbox/radio containers
- `form-check-input` - Checkbox/radio inputs
- `form-check-label` - Checkbox/radio labels
- `form-text` - Help text
- `form-label` - Field labels
- `form-floating` - Floating labels (optional)

### Layout Classes
- `mb-3` - Margin bottom for field spacing
- `row`, `col-*` - Grid system for layout
- `d-flex`, `justify-content-*` - Flexbox utilities

## Accordion Implementation

### Structure
- Each array in the form configuration creates a new accordion pane
- Accordion items are collapsible and independently accessible
- Users can navigate freely between panes
- No enforcement of completion before moving to next pane

### Bootstrap Accordion Classes
- `accordion` - Main accordion container
- `accordion-item` - Individual accordion sections
- `accordion-header` - Accordion section headers
- `accordion-button` - Clickable header buttons
- `accordion-collapse` - Collapsible content area
- `accordion-body` - Content container

## Element Creation Requirements

### MDN-Style Implementation
- Each form element type has its own dedicated function
- No helper functions or abstraction layers
- Direct DOM manipulation using standard methods:
  - `document.createElement()`
  - `element.setAttribute()`
  - `element.appendChild()`
  - `element.innerHTML` / `element.innerText`

### Element Functions Required
- `createTextInput(config)`
- `createEmailInput(config)`
- `createPasswordInput(config)`
- `createNumberInput(config)`
- `createTelInput(config)`
- `createUrlInput(config)`
- `createSearchInput(config)`
- `createColorInput(config)`
- `createDateInput(config)`
- `createDatetimeLocalInput(config)`
- `createMonthInput(config)`
- `createTimeInput(config)`
- `createWeekInput(config)`
- `createRangeInput(config)`
- `createFileInput(config)`
- `createCheckboxInput(config)`
- `createRadioInput(config)`
- `createHiddenInput(config)`
- `createTextarea(config)`
- `createSelect(config)`
- `createBootstrapElement(config)`

## Functional Requirements

### Navigation
- Free movement between accordion panes
- No validation blocking navigation
- Visual indication of current pane
- Collapsible/expandable sections

### Form Handling
- Real-time data binding to form object
- Support for all HTML input attributes
- Proper Bootstrap styling application
- Help text and descriptions support

### Data Management
- Form values stored in JavaScript object
- Dynamic form generation from JSON
- Support for default values
- Form reset functionality

### Accessibility
- Proper label associations
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management

## Browser Compatibility
- Modern browsers supporting ES6+
- Bootstrap 5.3 compatible browsers
- No polyfills required for target browsers

## Performance Considerations
- Efficient DOM manipulation
- Minimal reflows during form generation
- Event delegation for dynamic content
- Memory leak prevention
