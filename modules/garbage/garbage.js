/**
 * A sophisticated garbage collector for managing destructible functions
 * with comprehensive debugging and inspection capabilities.
 */
export class GarbageCollector {
}

/**
 * A hierarchical garbage collector inspired by Linux process trees
 * Structure: app/plugin-name/plugin-destructibles, app/plugin-name/recordId-destructibles
 */
class TreeNode {
    constructor(name, parent = null, type = 'branch', destructible = null, description = '') {
        this.name = name;
        this.parent = parent;
        this.type = type; // 'root', 'branch', 'leaf'
        this.children = new Map();
        this.destructible = destructible;
        this.description = description;
        this.createdAt = new Date();
        this.pid = this._generatePID();
        this.metadata = {};

        // Add to parent's children if parent exists
        if (parent) {
            parent.children.set(name, this);
        }
    }

    _generatePID() {
        return Math.floor(Math.random() * 90000) + 10000;
    }

    getUptime() {
        return Date.now() - this.createdAt.getTime();
    }

    getUptimeFormatted() {
        const uptime = this.getUptime();
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    getPath() {
        const path = [];
        let current = this;
        while (current && current.type !== 'root') {
            path.unshift(current.name);
            current = current.parent;
        }
        return '/' + path.join('/');
    }

    getDepth() {
        let depth = 0;
        let current = this.parent;
        while (current) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    addChild(name, type = 'branch', destructible = null, description = '') {
        const child = new TreeNode(name, this, type, destructible, description);
        return child;
    }

    removeChild(name) {
        return this.children.delete(name);
    }

    findChild(name) {
        return this.children.get(name);
    }

    getAllDescendants() {
        const descendants = [];

        const traverse = (node) => {
            for (const child of node.children.values()) {
                descendants.push(child);
                traverse(child);
            }
        };

        traverse(this);
        return descendants;
    }

    getLeafNodes() {
        return this.getAllDescendants().filter(node => node.type === 'leaf');
    }

    isLeaf() {
        return this.children.size === 0;
    }

    hasDestructible() {
        return typeof this.destructible === 'function';
    }
}

export class GarbageTree {
    constructor(options = {}) {
        this.root = new TreeNode('app', null, 'root', null, 'Application root');
        this.debug = options.debug || false;
        this.executionHistory = [];
        this.maxHistorySize = options.maxHistorySize || 1000;
        this.stats = {
            totalExecutions: 0,
            totalErrors: 0,
            totalDestructibles: 0
        };

        this._validateOptions(options);
    }

    _validateOptions(options) {
        if (typeof options !== 'object' || options === null) {
            throw new Error('Options must be an object');
        }
    }

    _log(message, data = null) {
        if (this.debug) {
            const timestamp = new Date().toISOString();
            console.log(`[TreeGC ${timestamp}] ${message}`, data || '');
        }
    }

    _recordExecution(type, path, count, errors = 0) {
        const record = {
            timestamp: new Date().toISOString(),
            type,
            path,
            count,
            errors,
            totalNodes: this.getTotalNodes()
        };

        this.executionHistory.push(record);
        this.stats.totalExecutions += count;
        this.stats.totalErrors += errors;

        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }

        this._log(`Executed ${type} at ${path}`, record);
    }

    /**
     * Navigate to or create a path in the tree
     * @param {string} path - Path like "/plugin-name" or "/plugin-name/record-123"
     * @returns {TreeNode} The node at the path
     */
    navigateToPath(path) {
        if (!path.startsWith('/')) {
            throw new Error('Path must start with /');
        }

        const parts = path.split('/').filter(part => part.length > 0);
        let current = this.root;

        for (const part of parts) {
            let child = current.findChild(part);
            if (!child) {
                // Determine node type based on position and naming convention
                const isLast = parts.indexOf(part) === parts.length - 1;
                const isRecord = part.includes('-') && /\d/.test(part);
                let nodeType = 'branch';
                let description = '';

                if (parts.length === 1) {
                    // Plugin level
                    nodeType = 'branch';
                    description = `Plugin: ${part}`;
                } else if (parts.length === 2) {
                    // Record or sub-component level
                    nodeType = 'branch';
                    description = isRecord ? `Record: ${part}` : `Component: ${part}`;
                }

                child = current.addChild(part, nodeType, null, description);
                this._log(`Created node at path: ${child.getPath()}`);
            }
            current = child;
        }

        return current;
    }

    /**
     * Add a destructible to a specific path
     * @param {string} path - Path to add destructible to
     * @param {function} destructible - The cleanup function
     * @param {string} description - Description of what this destructible does
     * @param {object} metadata - Additional metadata
     */
    add(path, destructible, description = '', metadata = {}) {
        if (typeof destructible !== 'function') {
            throw new Error('Destructible must be a function');
        }

        if(Array.isArray(path)){ path = '/' + path.join('/') }

        const parentNode = this.navigateToPath(path);
        const leafName = `destructible-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const leafNode = parentNode.addChild(
            leafName,
            'leaf',
            destructible,
            description || 'Cleanup task'
        );

        leafNode.metadata = { ...metadata };
        this.stats.totalDestructibles++;

        this._log(`Added destructible at ${leafNode.getPath()}: ${description}`);
        return leafNode;
    }

    /**
     * Execute destructibles at a specific path and optionally its children
     * @param {string} path - Path to execute
     * @param {boolean} recursive - Whether to execute children recursively
     */
    free(path, recursive = true) {

      if(Array.isArray(path)){ path = '/' + path.join('/') }

        const node = this.findNode(path);
        if (!node) {
            this._log(`No node found at path: ${path}`);
            return { executed: 0, errors: 0 };
        }

        let executed = 0;
        let errors = 0;
        const nodesToProcess = recursive ? [node, ...node.getAllDescendants()] : [node];

        // Execute in reverse order (leaves first, like process cleanup)
        const leaves = nodesToProcess.filter(n => n.hasDestructible()).reverse();

        for (const leafNode of leaves) {
            try {
                leafNode.destructible();
                executed++;
                this._log(`Executed destructible: ${leafNode.getPath()}`);

                // Remove the leaf node after execution
                if (leafNode.parent) {
                    leafNode.parent.removeChild(leafNode.name);
                }
            } catch (error) {
                errors++;
                this._log(`Error executing ${leafNode.getPath()}: ${error.message}`);
            }
        }

        // Clean up empty branches if recursive
        if (recursive) {
            this._cleanupEmptyBranches(node);
        }

        this._recordExecution('free', path, executed, errors);
        return { executed, errors };
    }

    /**
     * Remove empty branches after cleanup
     * @private
     */
    _cleanupEmptyBranches(startNode) {
        const traverse = (node) => {
            // Get children that are branches and empty
            const emptyBranches = Array.from(node.children.values())
                .filter(child => child.type === 'branch' && child.children.size === 0);

            emptyBranches.forEach(branch => {
                node.removeChild(branch.name);
                this._log(`Removed empty branch: ${branch.getPath()}`);
            });

            // Recursively clean children
            for (const child of node.children.values()) {
                if (child.type === 'branch') {
                    traverse(child);
                }
            }
        };

        traverse(startNode);
    }

    /**
     * Find a node by path
     */
    findNode(path) {
        if (path === '/' || path === '') {
            return this.root;
        }

        const parts = path.split('/').filter(part => part.length > 0);
        let current = this.root;

        for (const part of parts) {
            current = current.findChild(part);
            if (!current) {
                return null;
            }
        }

        return current;
    }

    /**
     * List all nodes at a specific path
     */
    list(path = '/', depth = null) {
        const node = this.findNode(path);
        if (!node) {
            return [];
        }

        const result = [];
        const traverse = (current, currentDepth = 0) => {
            if (depth !== null && currentDepth > depth) {
                return;
            }

            for (const child of current.children.values()) {
                const info = {
                    pid: child.pid,
                    name: child.name,
                    path: child.getPath(),
                    type: child.type,
                    description: child.description,
                    uptime: child.getUptimeFormatted(),
                    uptimeMs: child.getUptime(),
                    children: child.children.size,
                    hasDestructible: child.hasDestructible(),
                    depth: child.getDepth(),
                    metadata: child.metadata
                };
                result.push(info);

                if (child.type === 'branch') {
                    traverse(child, currentDepth + 1);
                }
            }
        };

        traverse(node);
        return result.sort((a, b) => a.path.localeCompare(b.path));
    }

    /**
     * Get process tree view (similar to pstree)
     */
    tree(path = '/', showPids = true, showDescriptions = false) {
        const node = this.findNode(path);
        if (!node) {
            return 'Path not found';
        }

        let output = '';
        const traverse = (current, prefix = '', isLast = true) => {
            const connector = isLast ? '└─ ' : '├─ ';
            const nameDisplay = showPids ? `${current.name}(${current.pid})` : current.name;
            const description = showDescriptions && current.description ?
                ` - ${current.description}` : '';
            const uptime = ` [${current.getUptimeFormatted()}]`;
            const destructibleMarker = current.hasDestructible() ? ' 🧹' : '';

            output += prefix + connector + nameDisplay + uptime + description + destructibleMarker + '\n';

            const children = Array.from(current.children.values());
            children.forEach((child, index) => {
                const isLastChild = index === children.length - 1;
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                traverse(child, childPrefix, isLastChild);
            });
        };

        // Start with the root node display
        const rootDisplay = showPids ? `${node.name}(${node.pid})` : node.name;
        const rootDescription = showDescriptions && node.description ?
            ` - ${node.description}` : '';
        output += rootDisplay + ` [${node.getUptimeFormatted()}]` + rootDescription + '\n';

        // Traverse children
        const children = Array.from(node.children.values());
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            traverse(child, '', isLast);
        });

        return output;
    }

    /**
     * Get detailed statistics
     */
    getStats() {
        const totalNodes = this.getTotalNodes();
        const leafNodes = this.getLeafNodes();
        const branchNodes = totalNodes - leafNodes;
        const destructibleNodes = this.getDestructibleCount();

        return {
            totalNodes,
            branchNodes,
            leafNodes,
            destructibleNodes,
            totalExecutions: this.stats.totalExecutions,
            totalErrors: this.stats.totalErrors,
            executionHistorySize: this.executionHistory.length,
            debugMode: this.debug
        };
    }

    getTotalNodes() {
        return 1 + this.root.getAllDescendants().length;
    }

    getLeafNodes() {
        return this.root.getLeafNodes().length;
    }

    getDestructibleCount() {
        return this.root.getAllDescendants().filter(node => node.hasDestructible()).length;
    }

    /**
     * Search for nodes by name, description, or path pattern
     */
    search(query, searchType = 'name') {
        const allNodes = [this.root, ...this.root.getAllDescendants()];
        const results = [];

        for (const node of allNodes) {
            let match = false;

            switch (searchType) {
                case 'name':
                    match = node.name.toLowerCase().includes(query.toLowerCase());
                    break;
                case 'description':
                    match = node.description.toLowerCase().includes(query.toLowerCase());
                    break;
                case 'path':
                    match = node.getPath().toLowerCase().includes(query.toLowerCase());
                    break;
                case 'regex':
                    const regex = new RegExp(query, 'i');
                    match = regex.test(node.name) || regex.test(node.description) || regex.test(node.getPath());
                    break;
            }

            if (match) {
                results.push({
                    pid: node.pid,
                    name: node.name,
                    path: node.getPath(),
                    type: node.type,
                    description: node.description,
                    uptime: node.getUptimeFormatted(),
                    hasDestructible: node.hasDestructible()
                });
            }
        }

        return results;
    }

    /**
     * Get execution history
     */
    getHistory(limit = null) {
        const history = [...this.executionHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * Pretty print the entire tree
     */
    inspect(path = '/', showPids = true, showDescriptions = true) {
        console.log('\n🌳 Application Garbage Collector Tree');
        console.log('=====================================');
        console.log(this.tree(path, showPids, showDescriptions));

        const stats = this.getStats();
        console.log('📊 Statistics:');
        console.log(`├─ Total Nodes: ${stats.totalNodes}`);
        console.log(`├─ Branch Nodes: ${stats.branchNodes}`);
        console.log(`├─ Leaf Nodes: ${stats.leafNodes}`);
        console.log(`├─ Destructible Nodes: ${stats.destructibleNodes}`);
        console.log(`├─ Total Executions: ${stats.totalExecutions}`);
        console.log(`├─ Total Errors: ${stats.totalErrors}`);
        console.log(`└─ Debug Mode: ${stats.debugMode ? 'ON' : 'OFF'}`);
        console.log('=====================================\n');

        return stats;
    }

    /**
     * Clear all nodes and reset
     */
    clear() {
        const totalNodes = this.getTotalNodes();
        this.root = new TreeNode('app', null, 'root', null, 'Application root');
        this.stats.totalDestructibles = 0;
        this._log(`Cleared ${totalNodes} nodes without execution`);
        return this;
    }

    /**
     * Enable or disable debug mode
     */
    setDebug(enabled) {
        this.debug = enabled;
        this._log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
        return this;
    }
}


function demo(){
  // ============================================================================
  // COMPREHENSIVE EXAMPLE USAGE & DEMONSTRATION
  // ============================================================================

  console.log('🚀 Tree-Based Garbage Collector Demo\n');

  // Create the garbage collector with debugging
  const tgc = new GarbageTree({ debug: true, maxHistorySize: 100 });

  console.log('📝 Setting up application structure...\n');

  // Plugin 1: Database Plugin
  tgc.add('/database-plugin', () => console.log('  🔌 Disconnecting from database pool'), 'Main database connection cleanup');

  tgc.add('/database-plugin/record-user-123', () => console.log('  👤 Cleaning up user 123 session'), 'User session cleanup', { userId: 123, sessionType: 'web' });

  tgc.add('/database-plugin/record-user-123', () => console.log('  🗂️  Removing user 123 temp files'),
    'Temporary file cleanup', { userId: 123, fileCount: 5 });

  tgc.add('/database-plugin/record-order-456', () => console.log('  🛒 Finalizing order 456 transaction'),
          'Order transaction cleanup', { orderId: 456, amount: 99.99 });

  // Plugin 2: Cache Plugin
  tgc.add('/cache-plugin', () => console.log('  🗄️  Flushing main cache'),
          'Main cache flush');

  tgc.add('/cache-plugin/record-session-789', () => console.log('  🎫 Clearing session 789 cache'),
          'Session cache cleanup', { sessionId: 789, cacheSize: '2.3MB' });

  tgc.add('/cache-plugin/record-session-789', () => console.log('  📊 Updating session 789 metrics'),
          'Session metrics update', { sessionId: 789, duration: 3600 });

  // Plugin 3: WebSocket Plugin
  tgc.add('/websocket-plugin', () => console.log('  🌐 Shutting down WebSocket server'),
          'WebSocket server shutdown');

  tgc.add('/websocket-plugin/record-connection-101', () => console.log('  🔗 Closing connection 101'),
          'WebSocket connection cleanup', { connectionId: 101, protocol: 'ws' });

  tgc.add('/websocket-plugin/record-connection-102', () => console.log('  🔗 Closing connection 102'),
          'WebSocket connection cleanup', { connectionId: 102, protocol: 'wss' });

  // Plugin 4: File System Plugin
  tgc.add('/filesystem-plugin', () => console.log('  📁 Cleaning up file system watchers'),
          'File system watcher cleanup');

  tgc.add('/filesystem-plugin/record-upload-555', () => console.log('  📤 Removing upload 555 temp files'),
          'Upload cleanup', { uploadId: 555, size: '15MB', status: 'completed' });

  console.log('🌳 Current application tree:');
  tgc.inspect();

  // Demonstrate various operations
  console.log('🔍 Searching for user-related nodes:');
  console.table(tgc.search('user', 'description'));

  console.log('\n📋 Listing all nodes with details:');
  console.table(tgc.list('/'));

  console.log('\n🎯 Cleaning up specific record (user-123):');
  const result1 = tgc.free('/database-plugin/record-user-123');
  console.log(`Result: ${result1.executed} executed, ${result1.errors} errors`);

  console.log('\n🎯 Cleaning up entire cache plugin:');
  const result2 = tgc.free('/cache-plugin');
  console.log(`Result: ${result2.executed} executed, ${result2.errors} errors`);

  console.log('\n🌳 Tree after partial cleanup:');
  console.log(tgc.tree('/', true, true));

  console.log('🔍 Search for remaining connections:');
  console.table(tgc.search('connection', 'description'));

  console.log('\n🧹 Final cleanup - all remaining destructibles:');
  const finalResult = tgc.free('/');
  console.log(`Final cleanup: ${finalResult.executed} executed, ${finalResult.errors} errors`);

  console.log('\n📈 Final statistics and history:');
  console.log('Stats:', tgc.getStats());
  console.log('\nExecution History:');
  console.table(tgc.getHistory());

  console.log('✨ Tree-based garbage collection demo completed!');


}
