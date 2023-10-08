//lambda function to return the keyword with a string

export const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(`Aravind says ${event.queryStringParameters.keyword}!`),
  };
  return response;
};
