import {render, screen} from '@testing-library/react'
import Home from '../../src/pages/index'

const mockData = {
    id : "1",
    firstName : "John",
    middleInitial : "A",
    lastName : "Doe",
    role : "IT",
    idNumber : "123",
}

jest.mock('../../src/pages/index', () => {
    return {
        getServerSideProps : async () => {
            return {
                props : {
                    data : mockData
                }
            }
        },
        default : jest.fn()
    }
})

test('Component should render Correctly', async () => {
    const { getByText } = render(<Home data={[mockData]}/>)

    expect(getByText('1')).toBeInTheDocument()
    expect(getByText('John')).toBeInTheDocument()
    expect(getByText('A')).toBeInTheDocument()
    expect(getByText('Doe')).toBeInTheDocument()
    expect(getByText('IT')).toBeInTheDocument()
    expect(getByText('123')).toBeInTheDocument()

})

