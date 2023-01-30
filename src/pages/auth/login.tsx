import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Form, Input, Message } from 'semantic-ui-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'


const login : React.FC = () => {
    const router = useRouter()
    const [data, setData] = useState({
        username : '',
        password : ''
    })
    const [type, setType] = useState('password')
    const [icon, setIcon] = useState('eye')
    const [wrongUserOrPassError, setWrongUserOrPassError] = useState(true)
    const [emptyFieldsError, setEmptyFieldsError] = useState(true)

    function handleChange( e : React.ChangeEvent<HTMLInputElement>) {
      setData({...data, [e.target.id] : e.target.value})
    }

    function handleShowPassword(){
      (setType(prevType => prevType === 'password' ? 'text' : 'password'), setIcon(prevIcon => prevIcon === 'eye' ? 'eye slash' : 'eye'))
    }

    useEffect(() => {
      (setEmptyFieldsError(true), setWrongUserOrPassError(true))
    }, [data])

    async function handleLogin(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        if(data.username === '' || data.password === ''){
          setEmptyFieldsError(false)
          return;
        }
  
        const res = await signIn('credentials',{
          username : data.username,
          password : data.password,
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
                    <Input type={type} id='password' onChange={handleChange} iconPosition={'left'} icon={{name : 'user secret'}} placeholder='Password'
                    action={{
                        icon : icon,
                        color: 'teal',
                        onClick : () => {handleShowPassword()}
                    }}/>
                </Form.Field>
                <Message
            error = {wrongUserOrPassError}
            color='red'
            header='Login Failed!'
            content='Username or password is incorrect!'
        />
            <Message
            error = {emptyFieldsError}
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