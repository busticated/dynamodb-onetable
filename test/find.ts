/*
    find-and-scan.ts - Basic find and scan options
 */
import {AWS, Client, Match, Table, print, dump, delay} from './utils/init'
import {DefaultSchema} from './schemas'

const table = new Table({
    name: 'FindTable',
    client: Client,
    schema: DefaultSchema,
})

test('Create Table', async() => {
    if (!(await table.exists())) {
        await table.createTable()
        expect(await table.exists()).toBe(true)
    }
})

let User = table.getModel('User')
let user: any
let users: any[]

let data = [
    {name: 'Peter Smith', email: 'peter@example.com', status: 'active' },
    {name: 'Patty O\'Furniture', email: 'patty@example.com', status: 'active' },
    {name: 'Cu Later', email: 'cu@example.com', status: 'inactive' },
]

test('Create Users', async() => {
    for (let item of data) {
        await User.create(item)
    }
    //  This will do a query with 'begins:#user'
    users = await User.find({}, {index: 'gs2'})
    expect(users.length).toBe(data.length)
})

test('Find with filter', async() => {
    users = await User.find({status: 'active'}, {index: 'gs2'})
    expect(users.length).toBe(data.filter(i => i.status == 'active').length)
})

test('Find with Projection', async() => {
    let nameOnly = await User.find({name: data[0].name}, {index: 'gs1', fields: ['name']})
    expect(nameOnly.length).toBe(1)
    expect(Object.keys(nameOnly[0])).toEqual(['name'])
})

test('Find with where clause', async() => {
    let items = await User.find({}, {
        where: '(${status} = {active}) and (${email} = {peter@example.com} and ${name} <> {Unknown})',
        log: true,
        index: 'gs2',
    })
    expect(items.length).toBe(1)
})

test('Destroy Table', async() => {
    await table.deleteTable('DeleteTableForever')
    expect(await table.exists()).toBe(false)
})
