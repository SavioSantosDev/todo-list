import app from './App';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log();
  console.log(`Server is running in port ${port}`);
});
