const router = require('express').Router()
const { body, validationResult, check } = require('express-validator')
const User = require('../models/User')

/*
 * @route 	GET api/users
 * @desc 	GET all list of users
 */
router.get('/', async (req, res) => {
  // Page number
  const page = parseInt(req.query.page) || 1

  // Number of users per page
  const limit = parseInt(req.query.limit) || 10

  const collectionCount = await User.count()

  // Start data of the pagination
  const startIndex = (page - 1) * limit

  // End data of the pagination
  const endIndex = page * limit

  const paging = {}

  if (endIndex < collectionCount) {
    paging.next = {
      page: page + 1,
      limit: limit,
    }
  } else {
    paging.next = {
      page: null,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    paging.previous = {
      page: page - 1,
      limit: limit,
    }
  } else {
    paging.previous = {
      page: null,
      limit: limit,
    }
  }

  try {
    const users = await User.find().limit(limit).skip(startIndex)

    paging.totalPages = Math.ceil(collectionCount / limit) // Total pa ges
    paging.currentPage = Math.ceil(startIndex / limit) + 1 // Current page
    paging.totalDataCount = collectionCount // Total data count
    paging.pageSize = limit // Page size

    // return a paginated list of users
    res.status(200).json({
      data: users,
      paging,
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ msg: error.message })
  }
})

/*
 * @route 	POST api/users
 * @desc 	Create a new user
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please put valid email')
      .notEmpty()
      .withMessage('Email is required'),
    body('address').notEmpty().withMessage('Address is required'),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, address } = req.body

    try {
      // Register new user
      const newUser = new User({
        name: name,
        email: email,
        address: address,
      })

      const saveUser = await newUser.save()
      res.status(201).json(saveUser)
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ msg: error.message })
    }
  }
)

/*
 * @route 	GET api/users/:id
 * @desc 	GET single user
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })

    // Check for user if exist
    if (!user) {
      return res.status(404).json({ msg: 'User does not exist' })
    }

    res.json(user)
  } catch (error) {
    console.log(error.message)

    // If Id is not object id
    if (error.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' })
    }

    res.status(500).json({ msg: error.message })
  }
})

/*
 * @route 	POST api/users/:id/address
 * @desc 	Add new address to user
 */
router.post(
  '/:id/address',
  [body('house_no').notEmpty().withMessage('House No is required')],
  [body('street').notEmpty().withMessage('Street is required')],
  [body('city').notEmpty().withMessage('City is required')],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { house_no, street, city } = req.body

    try {
      const user = await User.findOne({ _id: req.params.id })

      // Check for user if exist
      if (!user) {
        return res.json({ msg: 'User does not exist' })
      }

      user.address.unshift({
        house_no,
        street,
        city,
      }) // Add to address using unshift or push method (put in first)

      await user.save()

      res.json(user.address)
    } catch (error) {
      console.log(error.message)

      // If Id is not object id
      if (error.kind == 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' })
      }

      res.status(500).json({ msg: error.message })
    }
  }
)

/*
 * @route 	PUT api/users/:id
 * @desc 	Update a user
 */
router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please put valid email')
      .notEmpty()
      .withMessage('Email is required'),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email } = req.body

    try {
      const user = await User.findOne({ _id: req.params.id })

      // Check for user if exist
      if (!user) {
        return res.status(404).json({ msg: 'User does not exist' })
      }

      // Update
      user.name = name
      user.email = email

      await user.save() // Save Changes

      res.json(user)
    } catch (error) {
      console.log(error.message)

      // If Id is not object id
      if (error.kind == 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' })
      }

      res.status(500).json({ msg: error.message })
    }
  }
)

/*
 * @route 	PUT api/users/:userId/address/:addressId
 * @desc 	Update a user's address
 */
router.put(
  '/:userId/address/:addressId',
  [
    body('house_no').notEmpty().withMessage('House no is required'),
    body('city').notEmpty().withMessage('City no is required'),
    body('street').notEmpty().withMessage('Street no is required'),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { house_no, city, street } = req.body

    try {
      const user = await User.findOne({ _id: req.params.userId })

      // Check for user if exist
      if (!user) {
        return res.status(404).json({ msg: 'User does not exist' })
      }

      // Get the subdocument
      const address = user.address.id(req.params.addressId)

      // Check for user's address if exist
      if (!address) {
        return res.status(404).json({ msg: 'Address does not exist' })
      }

      address.house_no = house_no
      address.city = city
      address.street = street

      await user.save()

      res.json(user)
    } catch (error) {
      console.log(error.message)

      // If Id is not object id
      if (error.kind == 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' })
      }

      res.status(500).json({ msg: error.message })
    }
  }
)

/*
 * @route 	DELETE api/users/:userId
 * @desc 	Delete a user
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.deleteOne({ _id: req.params.id })

    if (user.deletedCount > 0) {
      res.status(200).json({ msg: 'Removed successfully' })
    } else {
      res.status(200).json({ msg: 'User not found' })
    }
  } catch (error) {
    console.log(error.message)

    // If Id is not object id
    if (error.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' })
    }

    res.status(500).json({ msg: error.message })
  }
})

/*
 * @route 	DELETE api/users/:userId/address/:addressId
 * @desc 	Delete a user's address
 */
router.delete('/:userId/address/:addressId', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId })

    // Check for user if exist
    if (!user) {
      return res.status(404).json({ msg: 'User does not exist' })
    }

    // Return the index by condition
    const removeIndex = user.address.findIndex(
      (address) => address.id == req.params.addressId
    )

    // No address index found
    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Address not found' })
    }

    user.address.splice(removeIndex, 1) // Remove the item on the array by index

    await user.save() // Save

    res.json(user)
  } catch (error) {
    console.log(error.message)

    // If Id is not object id
    if (error.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' })
    }

    res.status(500).json({ msg: error.message })
  }
})

module.exports = router
