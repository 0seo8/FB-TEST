import * as admin from 'firebase-admin'

admin.initializeApp()

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import todo from './routes/todo'
// import '../jobs'

const app = express()
app.use(express.json())
app.use(cors(
//   {
//   origin: [
//     'http://localhost:3000',
//     'kdt-test-97b7e.web.app', 
//     'kdt-test-97b7e.firebaseapp.com'
//   ]
// }
))
app.use('/todo', todo)

export const api = functions
	.region('asia-northeast3')
	.https.onRequest(app)
