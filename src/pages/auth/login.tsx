import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Form, Input, Message } from 'semantic-ui-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'

export const getServerSideProps : GetServerSideProps = async (context) => {
  try {
    const res = await axios.get('http://localhost:3000/api/getInfo/users/one')
    return {props: { data : res.data}}
  } catch (error) {
    return { props : { error : 'Something Went Wrong'}}
  }
}


const login : React.FC = ({ data } : InferGetServerSidePropsType<typeof getServerSideProps>) => {


    useEffect(() => {
      if(data.length === 0){
        router.push('/setup')
      }
    },[])

    const router = useRouter()
    const [Data, setData] = useState({
        username : '',
        password : ''
    })
    const [Type, setType] = useState('password')
    const [Icon, setIcon] = useState('eye')
    const [WrongUserOrPassError, setWrongUserOrPassError] = useState(true)
    const [EmptyFieldsError, setEmptyFieldsError] = useState(true)

    function handleChange( e : React.ChangeEvent<HTMLInputElement>) {
      setData({...Data, [e.target.id] : e.target.value})
    }

    function handleShowPassword(){
      (setType(prevType => prevType === 'password' ? 'text' : 'password'), setIcon(prevIcon => prevIcon === 'eye' ? 'eye slash' : 'eye'))
    }

    useEffect(() => {
      (setEmptyFieldsError(true), setWrongUserOrPassError(true))
    }, [Data])

    async function handleLogin(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        if(Data.username === '' || Data.password === ''){
          setEmptyFieldsError(false)
          return;
        }
  
        const res = await signIn('credentials',{
          username : Data.username,
          password : Data.password,
          redirect : false
        })



        if(res?.ok){
          router.push('/home')
        }else{
          if(res?.error){
            console.log(res.error)
          }
          setWrongUserOrPassError(false)
          return;
        }
    }

  return (
   <>
    <div className='form_container'>
      <Form>
                <Form.Field >
                    <label htmlFor='username'>Username</label>
                    <Input id='username' onChange={handleChange}iconPosition={'left'} icon={{name : 'user'}} placeholder='Username'/>
                </Form.Field>
                <Form.Field>
                    <label htmlFor='password'>Password</label>
                    <Input type={Type} id='password' onChange={handleChange} iconPosition={'left'} icon={{name : 'user secret'}} placeholder='Password'
                    action={{
                        icon : Icon,
                        color: 'teal',
                        onClick : () => {handleShowPassword()}
                    }}/>
                </Form.Field>
                <Message
            error = {WrongUserOrPassError}
            color='red'
            header='Login Failed!'
            content='Username or password is incorrect!'
        />
            <Message
            error = {EmptyFieldsError}
            color='red'
            header='Login Failed!'
            content='There are empty Fields'
        />
            <Button type='submit' onClick={handleLogin}>Submit</Button>
      </Form>
    </div>
   </>
  )
}

export default login