import { useState, useEffect, useCallback } from 'react'
import Table from './components/Table'

import { UserColumns } from './columns/UserColumns'
import { getUsers } from './service/UserService'

function App() {
  const [users, setUsers] = useState([]) // Set the state for the users

  const [loading, setLoading] = useState(true) // Set the state for the loading

  const [pageCount, setPageCount] = useState(0) // Set the state for the page count

  const fetchData = useCallback(async ({ pageSize, pageIndex }) => {
    setLoading(true) // Set the loading to true

    const startIndex = parseInt(pageIndex + 1) // Get the start index

    // Get the the new data of paginated users
    const { data, paging } = await getUsers(startIndex, pageSize)

    setUsers(data) // Set the users
    setPageCount(paging.totalPages) // Set the page count
    setLoading(false) // Set the loading
  }, [])

  // Get the data from the API on the first load
  const getData = async () => {
    setLoading(true)

    const initialPage = 1
    const initialPageSize = 10

    const { data, paging } = await getUsers(initialPage, initialPageSize)

    setUsers(data)
    setPageCount(paging.totalPages)
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-MnuFZ0YgRfO1zygVQSinqYSnKwWv2t0amw&usqp=CAU'
          width={50}
          height={50}
        />
        <h1>Serverside Pagination React Table</h1>
      </div>

      {users.length === 0 ? (
        <h1>Loading...</h1>
      ) : (
        <Table
          columns={UserColumns}
          data={users}
          pageCount={pageCount}
          loading={loading}
          fetchData={fetchData}
        />
      )}
    </div>
  )
}

export default App
