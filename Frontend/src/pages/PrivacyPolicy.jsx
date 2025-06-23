import React from "react";
import { Box, Typography } from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <Box sx={{ backgroundColor: '#f8f4fc', py: 4 }}>
      <Box p={4} maxWidth="800px" mx="auto">
        <Typography variant="h4" fontWeight="bold" mb={3} color="#4b2e2e">
          Privacy Policy
        </Typography>

        <Typography paragraph>
          <strong>1. Information We Collect:</strong> We collect various types of
          information to provide and improve our services:
        </Typography>
        <Typography paragraph sx={{ pl: 2 }}>
          • <strong>Personal Info:</strong> This includes your name, email address,
          shipping/billing address, phone number, and other similar data.
        </Typography>
        <Typography paragraph sx={{ pl: 2 }}>
          • <strong>Order Details:</strong> Information about the products you purchase,
          your payment methods, and order history.
        </Typography>
        <Typography paragraph sx={{ pl: 2 }}>
          • <strong>Device Info:</strong> Technical information such as your IP address,
          browser type, device identifiers, and cookies.
        </Typography>

        <Typography paragraph>
          <strong>2. How We Use Your Information:</strong> Your information helps us:
        </Typography>
        <Typography paragraph sx={{ pl: 2 }}>
          • Fulfill and manage your orders efficiently.<br />
          • Enhance your experience and provide better customer service.<br />
        </Typography>

        <Typography paragraph>
          <strong>3. Data Protection:</strong> We use strong security measures to protect
          your data. Payment information is handled securely through trusted third-party
          payment gateways and is never stored on our servers.
        </Typography>

        <Typography paragraph>
          <strong>4. Cookies:</strong> We use cookies to enhance your browsing experience.
          You can choose to disable cookies via your browser settings, though this may
          affect some functionalities on our website.
        </Typography>

        <Typography paragraph>
          <strong>5. Third-Party Sharing:</strong> We do not sell or rent your personal
          data. Certain information may be shared with payment processors, logistics
          providers, or service vendors strictly for fulfilling orders and legal compliance.
        </Typography>

        <Typography paragraph>
          <strong>6. Your Rights:</strong> You have the right to access your personal data,
          request corrections, or ask for deletion. To do so, please reach out to our support team.
        </Typography>

        <Typography paragraph>
          <strong>7. Updates to Policy:</strong> We may update this Privacy Policy from
          time to time. All changes will be reflected on this page along with the
          effective date.
        </Typography>

        <Typography
          variant="body2"
          mt={3}
          color="text.secondary"
          fontStyle="italic"
        >
          Last updated: June 2025
        </Typography>
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
