# Workspace Rules
You can write custom instructions and rules for the IDE (Antigravity) here. 

For example, you could uncomment the rule below to enforce a specific behavior:

<!--
<RULE>
Always use CSS variables from themes.css instead of hardcoding colors.
</RULE>
-->

<RULE>
Never use DOM until specified.
Never use emojis until specified.
Before updating project code, check for recent user-side errors logged in Firebase ('client_errors' collection / ErrorLoggerService) to address existing runtime issues first.
Run python3 check.py only once per chat session.
Whenever changes are made to code, functionality, endpoints, services, or environment variables in any conversation, regularly update both DEVELOPER_GUIDE.txt and AI_AGENTS_GUIDE.txt to keep the documentation synchronized with the codebase.
When making theme-related changes, make sure to apply them across all pages and maintain proper contrast between text colour and background colour.
<!--Whenever a new UI feature is implemented or an existing UI issue is fixed, always check and verify mobile (320px-480px), tablet (481px-1024px), and various window-size responsiveness for all affected pages. Use the browser to test at these breakpoints before considering the task done. Pay special attention to the AdminDashboard page. -->
</RULE>