# JSON Form Configuration Specification

## Overview
The JSON Form configuration is a JavaScript constant that defines the structure, fields, and behavior of a Bootstrap wizard form. It uses a nested array structure where each top-level array represents an accordion pane, and each object within those arrays represents a form field or element.

## Structure Format
```javascript
const form = [
  [ /* Pane 1 - Array of field objects */ ],
  [ /* Pane 2 - Array of field objects */ ],
  [ /* Pane N - Array of field objects */ ]
];
```

## Field Object Schema

### Common Properties
All field objects share these base properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✓ | Unique identifier for the field, used as form element name and ID |
| `type` | string | ✓ | HTML input type or custom type (see Input Types section) |
| `label` | string | ✓ | Display label text shown to user |
| `description` | string | ✗ | Help text displayed below the field |
| `value` | any | ✗ | Default value for the field |
| `required` | boolean | ✗ | Whether the field is required for form submission |
| `placeholder` | string | ✗ | Placeholder text for applicable input types |

### Type-Specific Properties

#### Numeric Inputs (number, range)
| Property | Type | Description |
|----------|------|-------------|
| `min` | string/number | Minimum allowed value |
| `max` | string/number | Maximum allowed value |
| `step` | string/number | Step increment for number inputs |

#### Date/Time Inputs (date, datetime-local, month, time, week)
| Property | Type | Description |
|----------|------|-------------|
| `min` | string | Minimum date/time value |
| `max` | string | Maximum date/time value |
| `step` | string | Step increment for time inputs |

#### File Inputs
| Property | Type | Description |
|----------|------|-------------|
| `accept` | string | File type restrictions (e.g., ".jpg,.png") |
| `multiple` | boolean | Allow multiple file selection |

#### Textarea
| Property | Type | Description |
|----------|------|-------------|
| `rows` | string/number | Number of visible text lines |
| `cols` | string/number | Number of visible character columns |

#### Select Dropdowns
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `options` | array | ✓ | Array of option objects |
| `multiple` | boolean | ✗ | Enable multiple selection |

#### Radio Buttons
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `options` | array | ✓ | Array of option objects |

#### Option Object Schema (for select and radio)
```javascript
{
  "value": "option_value",  // The value submitted with the form
  "text": "Display Text"    // The text shown to the user
}
```

### Bootstrap-Specific Elements
For creating custom Bootstrap elements:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `tagName` | string | ✓ | HTML tag name (div, span, p, etc.) |
| `id` | string | ✗ | Element ID attribute |
| `class` | string | ✗ | CSS class names (Bootstrap classes) |
| `innerText` | string | ✗ | Plain text content |
| `innerHTML` | string | ✗ | HTML content (use with caution) |

## Supported Input Types

### Text-Based Inputs
- `text` - Single-line text input
- `email` - Email address input with validation
- `password` - Password input (hidden characters)
- `search` - Search input with search styling
- `tel` - Telephone number input
- `url` - URL input with validation

### Numeric Inputs
- `number` - Numeric input with spinners
- `range` - Slider input for numeric ranges

### Date/Time Inputs
- `date` - Date picker
- `datetime-local` - Date and time picker
- `month` - Month picker
- `time` - Time picker
- `week` - Week picker

### Specialized Inputs
- `color` - Color picker
- `file` - File upload input
- `hidden` - Hidden form field

### Choice Inputs
- `checkbox` - Single checkbox
- `radio` - Radio button group (requires options array)

### Complex Elements
- `textarea` - Multi-line text input
- `select` - Dropdown selection (requires options array)

### Custom Elements
- Any `tagName` value creates a Bootstrap element using the tagName property

## Value Handling by Type

### String Values
- text, email, password, search, tel, url, date, datetime-local, month, time, week
- textarea, color, file (filename), hidden

### Numeric Values
- number, range

### Boolean Values
- checkbox (true/false)

### Array Values
- select with multiple=true (array of selected values)

### Special Cases
- radio: Returns the selected option's value as string
- file: Returns filename string (single file) or file object reference
- select (single): Returns selected option's value as string

## Example Complete Configuration

```javascript
const form = [
  [
    // Text inputs pane
    {
      "name": "firstName",
      "type": "text",
      "label": "First Name",
      "description": "Enter your first name",
      "value": "",
      "required": true,
      "placeholder": "John"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "description": "We'll never share your email",
      "value": "",
      "required": true
    }
  ],
  [
    // Choice inputs pane
    {
      "name": "country",
      "type": "select",
      "label": "Country",
      "description": "Select your country",
      "value": "",
      "required": true,
      "options": [
        {"value": "", "text": "Choose..."},
        {"value": "us", "text": "United States"},
        {"value": "ca", "text": "Canada"}
      ]
    },
    {
      "name": "gender",
      "type": "radio",
      "label": "Gender",
      "description": "Select your gender",
      "value": "",
      "options": [
        {"value": "male", "text": "Male"},
        {"value": "female", "text": "Female"},
        {"value": "other", "text": "Other"}
      ]
    },
    {
      "name": "newsletter",
      "type": "checkbox",
      "label": "Subscribe to Newsletter",
      "description": "Receive weekly updates",
      "value": false
    }
  ],
  [
    // Advanced inputs pane
    {
      "name": "birthdate",
      "type": "date",
      "label": "Birth Date",
      "description": "Your date of birth",
      "value": "",
      "max": "2005-12-31"
    },
    {
      "name": "favoriteColor",
      "type": "color",
      "label": "Favorite Color",
      "description": "Pick your favorite color",
      "value": "#3498db"
    },
    {
      "name": "experience",
      "type": "range",
      "label": "Years of Experience",
      "description": "Slide to select years",
      "value": "5",
      "min": "0",
      "max": "20",
      "step": "1"
    }
  ]
];
```

## Data Flow and Form State

### Initialization
1. Form data object (`formData`) is initialized with default values from each field's `value` property
2. Checkboxes default to `false` if no value specified
3. Other fields default to empty string if no value specified

### Real-time Updates
- Each field change immediately updates the corresponding property in `formData`
- The form data display updates automatically to show current state
- No validation occurs during typing/interaction (free-form editing)

### Form Submission
- `formData` object contains all current field values
- Values are typed according to their input type (string, number, boolean, array)
- Hidden fields are included in the final data

## Bootstrap Integration

### CSS Classes Applied
- `form-control` - Standard text inputs, selects, textareas
- `form-select` - Select dropdowns
- `form-range` - Range sliders
- `form-control-color` - Color inputs
- `form-check` - Checkbox/radio containers
- `form-check-input` - Checkbox/radio inputs
- `form-check-label` - Checkbox/radio labels
- `form-label` - Field labels
- `form-text` - Help text
- `mb-3` - Bottom margin for field spacing

### Accordion Structure
- Each top-level array becomes an `accordion-item`
- Automatic step numbering ("Step 1", "Step 2", etc.)
- First pane opens by default, others collapsed
- Free navigation between panes via accordion headers

## Validation and Error Handling

### Client-Side Validation
- HTML5 validation attributes applied based on field configuration
- `required` attribute added when `required: true`
- Input type validation (email, url, etc.) handled by browser
- Min/max constraints applied to numeric and date inputs

### Error States
- No custom error handling implemented (relies on browser validation)
- Form can be submitted with validation errors (non-blocking)
- Individual field validation occurs on form submission attempt

## Extensibility

### Adding New Input Types
1. Create new function following naming pattern: `create[Type]Input(config)`
2. Add case to `createFormField()` switch statement
3. Implement proper Bootstrap classes and event handling
4. Update this specification document

### Custom Bootstrap Elements
Use the `tagName` property to create any Bootstrap component:
```javascript
{
  "tagName": "div",
  "class": "alert alert-info",
  "innerText": "This is an informational message"
}
```

This specification provides the complete technical description needed to understand, modify, and extend the JSON form configuration system.
