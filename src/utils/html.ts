export const getBaseHtml = (body: string) => `
  <!doctype html>
    <head>
      <title>Community Hatch</title>
    </head>
    <body>${body}</body>
  </html>
`;

export const getRetryHtml = (link: string) => getBaseHtml(`
  <p>Something went wrong, try again clicking <a href=${link} target="_blank">here</a></p>
`);

export const getDoneHtml = () => getBaseHtml(`
  <p>Done! You can go back to the app now!</p>
`);

export const getNotFoundHtml = () => getBaseHtml(`
  <p>Account not found</p>
`);