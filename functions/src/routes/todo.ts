import * as express from 'express'
import * as admin from 'firebase-admin'
import {saveFile} from '../utils'

const router = express.Router()
const db = admin.firestore()

interface Todo {
  id?: string
  title: string,
  image?: string | null ,
  done: boolean,
  createdAt: string,
  updatedAt: string,
  deleted: boolean
}

router.get('/', async (req, res) => {
  const snaps =  await db.collection('Todos')
  .where('deleted', '!=', true)
  .get()
  
  const todos: Todo[] = []
  snaps.forEach(snap => {
    const fields = snap.data()

    todos.push({
      id: snap.id,
      ...fields as Todo
    })
  })

  //최신일 정렬
  todos.sort((a,b) => {
    const aTime : number = new Date(a.createdAt).getTime()
    const bTime : number = new Date(b.createdAt).getTime()
    return bTime-aTime
  })

  res.status(200).json(todos)
})

//todo추가
router.post('/', async (req, res) => {

  /*만약 제한을 걸고 싶은 경우 
  const {apikey, username} = req.headers

  if(apikey !== '1234qwer'||username !== 'heropy-admin') {
    res.status(401).json('유효한 사용자가 아닙니다.')
  }
  */

  const {title, imageBase64} = req.body
  const date = new Date().toISOString()

  let image = ''
  try {
    image = await saveFile(imageBase64)
  } catch(error) {
    console.log(error)
  }

  const todo: Todo = {
    title,
    image,
    done: false,
    createdAt: date,
    updatedAt: date,
    deleted: false
  }

  const ref = await db.collection('Todos').add(todo)

  res.status(200).json({
    id: ref.id,
    ...todo
  })
})

//todo 수정
router.put('/:id', async(req, res) => {
  const { title, done, imageBase64 } = req.body 
  const {id} = req.params

  const snap = await db.collection('Todos').doc(id).get()
  if(!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  // 스토리지에 파일 저장
  let image = ''
  try {
    image = await saveFile(imageBase64)
  } catch(error) {
    console.log(error)
  }

  const {createdAt} = snap.data() as Todo
  const updatedAt = new Date().toDateString

  await snap.ref.update({ //이것은 db를 갱신해주는 것이지 snap을 갱신해주는 것은 아닙니다.
    title,
    image,
    done,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    image,
    done,
    createdAt,
    updatedAt
  })
})

router.delete('/:id', async(req, res) => {
  const { id } = req.params
  const snap = await db.collection('Todos').doc(id).get()

  if(!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  await snap.ref.update({
    deleted: true,
  })

  return res.status(200).json(true)
})

/*로그인
router.post('/', async (req, res) => {
  const {id, pw} = req.body
  if(id === 'adim' && pw === '1234') {
    //처리
  }
})
*/
export default router
