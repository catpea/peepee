# Profile Specifications for Visual Programming Nodes

## Overview
Profiles are pre-configured templates that demonstrate powerful design patterns for visual programming nodes. They provide users with inspired examples that can be customized rather than starting from scratch.

## Profile Categories

### 🔗 Supervision Patterns
**Purpose**: Manage and coordinate worker processes, implement fault tolerance and error recovery.

### 📦 Queue Patterns
**Purpose**: Handle data storage, distribution, and flow control in processing pipelines.

### 🌐 HTTP Operations
**Purpose**: Interact with web services, APIs, and external data sources.

### ⚙️ Data Processing
**Purpose**: Transform, filter, and manipulate data as it flows through the pipeline.

### 🎯 Reducers/Consumers
**Purpose**: Aggregate, validate, or output data at the end of processing pipelines.

## Profile Structure

Each profile is a JSON object that maps directly to the form fields:

```javascript
const profileName = {
    nodeTitle: "string",           // Clear, descriptive node name
    nodeType: "PRODUCER|TRANSDUCER|REDUCER", // Node classification
    userRole: "string",            // Who benefits from this node
    userWant: "string",            // What functionality it provides
    userBenefit: "string",         // Why it's valuable
    scenario1Title: "string",      // Primary test scenario name
    scenario1Given: "string",      // Initial context
    scenario1When: "string",       // Triggering event
    scenario1Then: "string",       // Expected outcome
    scenario2Title: "string",      // Edge case scenario (optional)
    scenario2Given: "string",      // Edge case context
    scenario2When: "string",       // Edge case trigger
    scenario2Then: "string",       // Edge case outcome
    scenario3Title: "string",      // Error/advanced scenario (optional)
    scenario3Given: "string",      // Error context
    scenario3When: "string",       // Error trigger
    scenario3Then: "string",       // Error handling
    customProperties: "string",    // Multi-line property definitions
    additionalContext: "string"    // Extra requirements/constraints
}
```

## Current Profiles

### Supervision Patterns

#### Job Supervisor
**Category**: 🔗 Supervision
**Type**: TRANSDUCER
**Purpose**: Coordinates worker processes with error handling and timeout management.

**Key Features**:
- Worker lifecycle management
- Circuit breaker pattern
- Health check monitoring
- Retry logic with exponential backoff

**Custom Properties**:
- `workerPort`: EventEmitter connection to worker
- `timeoutMs`: Worker response timeout
- `retryCount`: Maximum retry attempts

#### HTTP Worker
**Category**: 🔗 Supervision
**Type**: TRANSDUCER
**Purpose**: Reliable HTTP request worker with comprehensive error handling.

**Key Features**:
- All HTTP methods support
- Automatic retries with backoff
- Timeout handling
- Response validation

**Custom Properties**:
- `timeout`: Request timeout duration
- `retries`: Number of retry attempts
- `headers`: Default HTTP headers

### Queue Patterns

#### Push Queue
**Category**: 📦 Queue
**Type**: TRANSDUCER
**Purpose**: Active data distribution with overflow management.

**Key Features**:
- High watermark notifications
- Multiple overflow policies
- Consumer management
- Priority queuing support

**Custom Properties**:
- `maxSize`: Queue capacity limit
- `overflowPolicy`: Behavior when full ('drop', 'block', 'error')
- `periodicEmit`: Enable timed data emission

#### Pull Queue
**Category**: 📦 Queue
**Type**: PRODUCER
**Purpose**: On-demand data serving with flow control.

**Key Features**:
- Consumer-controlled flow
- Fair scheduling algorithms
- Wait policies for empty queue
- Concurrent request handling

**Custom Properties**:
- `waitPolicy`: Empty queue behavior ('immediate', 'block', 'callback')
- `scheduling`: Data distribution method ('fifo', 'lifo', 'round-robin')
- `maxWaiters`: Concurrent consumer limit

#### Output Queue
**Category**: 📦 Queue
**Type**: REDUCER
**Purpose**: Data accumulation and batch processing.

**Key Features**:
- Batch size configuration
- Time-based flushing
- Persistent storage options
- Compression support

### HTTP Operations

#### HTTP Fetch
**Category**: 🌐 HTTP
**Type**: TRANSDUCER
**Purpose**: Generic web requests with automatic content handling.

**Key Features**:
- Auto-detection of JSON responses
- CORS handling
- Request caching
- Content type processing

**Custom Properties**:
- `method`: HTTP method selection
- `headers`: Custom request headers
- `autoParseJson`: Automatic JSON parsing

#### API Client
**Category**: 🌐 HTTP
**Type**: TRANSDUCER
**Purpose**: Structured API interactions with authentication.

**Key Features**:
- Authentication token management
- Rate limiting compliance
- Response validation
- Error code mapping

### Data Processing

#### JSON Parser
**Category**: ⚙️ Processing
**Type**: TRANSDUCER
**Purpose**: Robust JSON string to object conversion.

**Key Features**:
- Streaming JSON support
- Custom reviver functions
- Error recovery policies
- Circular reference handling

**Custom Properties**:
- `strictMode`: Enforce strict parsing
- `reviver`: Custom parsing function
- `errorPolicy`: Error handling strategy

#### Text Transformer
**Category**: ⚙️ Processing
**Type**: TRANSDUCER
**Purpose**: String manipulation and text processing.

**Key Features**:
- Regular expression support
- Unicode handling
- Template processing
- Encoding conversion

#### Data Filter
**Category**: ⚙️ Processing
**Type**: TRANSDUCER
**Purpose**: Conditional data processing and routing.

**Key Features**:
- Multiple filter conditions
- Data routing based on criteria
- Schema validation
- Performance optimization

### Reducers/Consumers

#### Data Collector
**Category**: 🎯 Reducers
**Type**: REDUCER
**Purpose**: Aggregate results from multiple sources.

**Key Features**:
- Statistical aggregation
- Time-windowed collection
- Memory management
- Export capabilities

#### Logger
**Category**: 🎯 Reducers
**Type**: REDUCER
**Purpose**: Output data to console, files, or external services.

**Key Features**:
- Multiple output formats
- Log rotation
- Remote logging
- Performance monitoring

#### Validator
**Category**: 🎯 Reducers
**Type**: REDUCER
**Purpose**: Data validation and quality assurance.

**Key Features**:
- Schema validation
- Data quality metrics
- Error reporting
- Compliance checking

## Adding New Profiles

### Step 1: Define the Profile Object
Create a new entry in the `profiles` object:

```javascript
const profiles = {
    // ... existing profiles

    your_new_profile: {
        nodeTitle: "Your Node Name",
        nodeType: "PRODUCER|TRANSDUCER|REDUCER",
        userRole: "target user role",
        userWant: "what functionality this provides",
        userBenefit: "why this is valuable",
        scenario1Title: "primary use case",
        scenario1Given: "initial setup",
        scenario1When: "trigger event",
        scenario1Then: "expected outcome",
        // Add scenario2 and scenario3 for edge cases
        customProperties: "prop1 - type: description\nprop2 - type: description",
        additionalContext: "special requirements or constraints"
    }
};
```

### Step 2: Add to Dropdown Menu
Update the `<select>` element with your new option:

```html
<optgroup label="📂 Your Category">
    <option value="your_new_profile">Your Node Name - Brief description</option>
</optgroup>
```

### Step 3: Test the Profile
1. Select your profile from the dropdown
2. Verify all fields populate correctly
3. Generate the AI prompt to ensure completeness
4. Test the resulting node implementation

## Profile Design Guidelines

### 1. **Clear Naming**
- Use descriptive, actionable node titles
- Avoid technical jargon in user-facing names
- Include the primary function in the title

### 2. **Comprehensive Scenarios**
- **Scenario 1**: Happy path with typical input
- **Scenario 2**: Edge case or boundary condition
- **Scenario 3**: Error handling or exceptional case

### 3. **Realistic Use Cases**
- Base scenarios on actual user needs
- Include practical examples in Given/When/Then
- Consider real-world data formats and constraints

### 4. **Proper Classification**
- **PRODUCER**: Generates data (timers, sensors, generators)
- **TRANSDUCER**: Transforms data (processors, filters, converters)
- **REDUCER**: Consumes data (loggers, databases, validators)

### 5. **Custom Properties**
- Define all configurable aspects
- Include data types and descriptions
- Consider both simple and advanced use cases

### 6. **Additional Context**
- Mention performance considerations
- Include security requirements
- Note integration constraints
- Specify error handling approaches

## Integration with Form System

The profile system integrates seamlessly with the existing form:

1. **Selection**: User chooses from categorized dropdown
2. **Population**: `loadProfile()` updates all form fields
3. **Customization**: User can modify any populated field
4. **Generation**: AI prompt includes all profile-derived content

This approach provides users with powerful starting points while maintaining full customization capability.

## Best Practices for Profile Creation

### Design Patterns to Include
- **Circuit Breaker**: For fault tolerance
- **Retry Logic**: With exponential backoff
- **Timeout Handling**: For reliability
- **Flow Control**: To prevent overload
- **Error Recovery**: Graceful degradation

### Common Anti-Patterns to Avoid
- Overly complex single-purpose nodes
- Tight coupling between nodes
- Missing error handling scenarios
- Inadequate performance considerations
- Poor separation of concerns

### Testing Considerations
- Include boundary condition testing
- Consider concurrent operation scenarios
- Plan for failure recovery testing
- Include performance benchmarking
- Validate security assumptions

This profile system transforms the visual programming node designer from a blank slate into a showcase of powerful, proven design patterns that users can immediately understand and customize for their specific needs.
