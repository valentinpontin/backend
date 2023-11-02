import __dirname from '../utils/utils.js'
import handlebars from 'express-handlebars';
import path from 'path';

export default function configureHandlebars(app) {
  app.engine('handlebars', handlebars.engine());
  const viewsPath = path.join(__dirname, `'/../views`);
  app.set('views', viewsPath);
  app.set('view engine', 'handlebars');
}
