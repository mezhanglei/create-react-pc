/**
 * 双向链表
 */

function DoublyLinkedList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
  function Node(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

