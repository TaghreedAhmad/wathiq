import type { Access, CollectionConfig } from 'payload'

const isAppUser: Access = ({ req }) => req.user?.collection === 'users'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    useSessions: false,
  },
  access: {
    create: () => false,
    delete: () => false,
    read: isAppUser,
    update: isAppUser,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'employee',
      options: [
        { label: 'موظف', value: 'employee' },
        { label: 'مشرف', value: 'supervisor' },
        { label: 'مدير', value: 'manager' },
      ],
    },
  ],
  versions: false,
}
