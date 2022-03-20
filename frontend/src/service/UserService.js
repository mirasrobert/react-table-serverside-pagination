import axios from 'axios'

export const getUsers = async (page = 1, pageSize = 10) => {
  try {
    const users = await axios.get(`/api/users?page=${page}&limit=${pageSize}`)

    return users.data
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message)
  }
}
