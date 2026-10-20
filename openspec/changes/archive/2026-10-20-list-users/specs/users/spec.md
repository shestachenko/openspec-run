# Spec Delta

## Purpose

Отдаёт постраничный список пользователей, собранный из двух JSON-источников и отсортированный по id.

## ADDED Requirements

### Requirement: GET /users page
`GET /users` SHALL вернуть HTTP 200 и JSON-объект с полями `items` и `total`. `items` SHALL быть запрошенной страницей. `total` SHALL быть числом пользователей в первом источнике.

#### Scenario: First page
- **GIVEN** в первом источнике есть пользователи с id 1, 2 и 3
- **WHEN** клиент отправляет `GET /users?page=1&limit=2`
- **THEN** статус 200, в `items` пользователи 1 и 2 в этом порядке, `total` равен 3

#### Scenario: Empty source
- **GIVEN** в первом источнике нет пользователей
- **WHEN** клиент отправляет `GET /users`
- **THEN** статус 200, `items` — пустой массив, `total` равен 0

### Requirement: Accepted page and limit
Значение `page` или `limit` SHALL использоваться, если вся строка query состоит из десятичных цифр и целое значение не меньше 1. У `limit` SHALL не быть верхней границы.

#### Scenario: Explicit page and limit
- **GIVEN** 15 пользователей с id от 1 до 15
- **WHEN** клиент отправляет `GET /users?page=2&limit=2`
- **THEN** в `items` пользователи 3 и 4, `total` равен 15

#### Scenario: Large limit
- **GIVEN** 3 пользователя
- **WHEN** клиент отправляет `GET /users?limit=100`
- **THEN** в `items` все 3 пользователя

### Requirement: Default page and limit
Отсутствующий `page`, `page` не из одних десятичных цифр или `page` меньше 1 SHALL стать 1. Отсутствующий `limit`, `limit` не из одних десятичных цифр или `limit` меньше 1 SHALL стать 10. Второй параметр SHALL остаться принятым значением. Статус SHALL быть 200.

#### Scenario: No query
- **GIVEN** 12 пользователей с id от 1 до 12
- **WHEN** клиент отправляет `GET /users`
- **THEN** статус 200, в `items` пользователи с 1 по 10

#### Scenario: Invalid page keeps limit
- **GIVEN** 5 пользователей
- **WHEN** клиент отправляет `GET /users?page=abc&limit=2`
- **THEN** статус 200, в `items` пользователи 1 и 2, `total` равен 5

#### Scenario: Fractional limit
- **GIVEN** 12 пользователей
- **WHEN** клиент отправляет `GET /users?limit=10.5`
- **THEN** в `items` 10 пользователей

### Requirement: Sort by id
Система SHALL упорядочить пользователей по числовому `id` по возрастанию до нарезки страницы.

#### Scenario: Source order differs
- **GIVEN** пользователи с id 10, 2 и 1
- **WHEN** клиент отправляет `GET /users?limit=10`
- **THEN** порядок в `items`: 1, 2, 10

### Requirement: Page past the end
Если `page` начинается после последнего пользователя, `GET /users` SHALL вернуть HTTP 200, пустой массив `items` и полный `total`.

#### Scenario: Page beyond data
- **GIVEN** 3 пользователя
- **WHEN** клиент отправляет `GET /users?page=5&limit=2`
- **THEN** статус 200, `items` — пустой массив, `total` равен 3

### Requirement: Joined user fields
Каждый элемент SHALL содержать `id` и `username` из первого источника. Если во втором источнике есть этот `id`, `addresses` SHALL быть массивом объектов с `country`, `city` и `street`, `teams` SHALL быть массивом объектов с `name` и `department`, `manager` SHALL быть полным именем менеджера, `salary` SHALL быть JSON-числом.

#### Scenario: Second record present
- **GIVEN** пользователь 1 с username `ann` и вторая запись: один адрес (`FI`, `Helsinki`, `Aleksanterinkatu`), одна команда (`Core`, `Engineering`), manager `Ada Lovelace`, salary 100.00
- **WHEN** клиент отправляет `GET /users?page=1&limit=10`
- **THEN** у этого элемента те же значения полей, а `salary` — число 100

### Requirement: Missing second record
Если во втором источнике нет записи для `id`, этот пользователь SHALL остаться в `items` и в `total`. `addresses`, `teams`, `manager` и `salary` SHALL быть null.

#### Scenario: No matching second record
- **GIVEN** у пользователя 2 нет записи во втором источнике
- **WHEN** клиент отправляет `GET /users`
- **THEN** у элемента с id 2 поля `addresses`, `teams`, `manager` и `salary` равны null, и `total` включает пользователя 2
