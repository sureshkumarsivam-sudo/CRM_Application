#!/usr/bin/env node

/**
 * Component Generator Script
 * Usage: node scripts/create-component.js ComponentName [directory]
 * Example: node scripts/create-component.js UserProfile users
 */

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
const directory = process.argv[3] || 'components';

if (!componentName) {
  console.error('Please provide a component name');
  console.log('Usage: node scripts/create-component.js ComponentName [directory]');
  process.exit(1);
}

const componentDir = path.join(__dirname, '..', 'src', 'components', directory);
const componentPath = path.join(componentDir, `${componentName}.jsx`);

// Create directory if it doesn't exist
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Component template
const componentTemplate = `import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UnderDevelopment from '../UnderDevelopment';

const ${componentName} = () => {
  const navigate = useNavigate();

  // TODO: Remove this and implement your component
  const isUnderDevelopment = true;

  if (isUnderDevelopment) {
    return (
      <UnderDevelopment
        title="${componentName}"
        description="This component is being developed. Replace the isUnderDevelopment flag when ready."
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ${componentName}
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          ${componentName} component is ready for development.
        </Typography>
        
        {/* Add your component content here */}
        
      </Paper>
    </Box>
  );
};

export default ${componentName};
`;

// Write the component file
try {
  fs.writeFileSync(componentPath, componentTemplate);
  console.log(`✅ Component created successfully at: ${componentPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Open ${componentPath}`);
  console.log(`2. Set isUnderDevelopment = false when ready`);
  console.log(`3. Add your component to RouteConfig.jsx if it's a page`);
  console.log(`4. Import and use in your application`);
} catch (error) {
  console.error('❌ Error creating component:', error.message);
  process.exit(1);
}