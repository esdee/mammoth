import {
  count,
  defineDb,
  defineTable,
  integer,
  sum,
  text,
  timestampWithTimeZone,
  uuid,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T, true> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_id()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const bar = defineTable({
  id: uuid().primaryKey().default(`gen_random_id()`),
  startDate: timestampWithTimeZone().notNull().default(`now()`),
  endDate: timestampWithTimeZone().notNull().default(`now()`),
  value: integer(),
  fooId: uuid().references(foo, 'id'),
});

const db = defineDb({ foo, bar }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

// @dts-jest:group select
{
  // @dts-jest:fail:snap should not pollute column scope
  db.foo.id._columnBrand;

  // @dts-jest:snap should return null and not null properties
  toSnap(db.select(db.foo.id, db.foo.createDate, db.foo.value).from(db.foo));

  // @dts-jest:snap should return nullable properties of left joined columns
  toSnap(db.select(db.foo.id, db.bar.endDate, db.bar.value).from(db.foo).leftJoin(db.bar));

  // @dts-jest:snap should return nullable properties of left side properties when right joining
  toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).rightJoin(db.bar));

  // @dts-jest:snap should return renamed properties because of alias
  toSnap(db.select(db.foo.name.as(`fooName`), db.foo.value.as(`fooValue`)).from(db.foo));

  // @dts-jest:snap should return nullable properties of all sides because of full join
  toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).fullJoin(db.bar));

  // @dts-jest:snap should select expression
  toSnap(db.select(db.foo.value.plus(1)).from(db.foo));

  // @dts-jest:snap should select named expression
  toSnap(db.select(db.foo.value.plus(1).as(`test`)).from(db.foo));

  // @dts-jest:snap should select aggregate subquery
  toSnap(db.select(db.foo.id, db.select(count()).from(db.foo)).from(db.foo));

  // @dts-jest:snap should select null column in subquery
  toSnap(db.select(db.foo.id, db.select(db.foo.value).from(db.foo)).from(db.foo));

  // @dts-jest:snap should select aggregate with alias
  toSnap(db.select(db.foo.id, sum(db.foo.value).as(`total`)).from(db.foo));

  db.select(db.foo.id, db.foo.value)
    .from(db.foo)
    .then((result) => {
      // @dts-jest:snap should select and await result set
      result;
    });
}
