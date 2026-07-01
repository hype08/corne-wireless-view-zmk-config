import test from "node:test";
import assert from "node:assert/strict";
import {
  graphiteToPhysical,
  physicalToGraphite,
  renderLayoutRows,
} from "../src/layout.js";

test("translates current physical keys to Graphite output", () => {
  assert.equal(physicalToGraphite("q"), "b");
  assert.equal(physicalToGraphite("w"), "l");
  assert.equal(physicalToGraphite("f"), "d");
  assert.equal(physicalToGraphite("p"), "w");
  assert.equal(physicalToGraphite("m"), "y");
  assert.equal(physicalToGraphite("e"), "a");
});

test("finds physical key for Graphite letters", () => {
  assert.equal(graphiteToPhysical("b"), "q");
  assert.equal(graphiteToPhysical("l"), "w");
  assert.equal(graphiteToPhysical("d"), "f");
  assert.equal(graphiteToPhysical("y"), "m");
});

test("renders physical to Graphite rows for map mode", () => {
  assert.deepEqual(renderLayoutRows(), [
    "q->b  w->l  f->d  p->w  b->z      j->f  l->o  u->u  y->j  ;->;",
    "a->n  r->r  s->t  t->s  g->g      m->y  n->h  e->a  i->e  o->i",
    "z->q  x->x  c->m  d->c  v->v      k->k  h->p  ,->,  .->.  /->/",
  ]);
});
