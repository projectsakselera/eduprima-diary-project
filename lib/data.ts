// user data 
const users = [
  {
    name: "Admin",
    email: "adm@eduprima.id",
    password: "password",
    image: '/images/users/user-1.jpg',
  },
  
]

export type User = (typeof users)[number]

export const getUserByEmail = (email: string) => {
  return users.find((user) => user.email === email)
}