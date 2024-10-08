// 原始数据
const meals = [
  {
    name: '沙威玛烤肉',
    price: 66
  },
  {
    name: '烤三文鱼排',
    price: 88
  },
  {
    name: '慢炖羊腿',
    price: 118
  },
  {
    name: '松露披萨船',
    price: 68
  }
]

/**
 * 单个菜品的数据
 * 目的在于对原始数据做一层封装，添加上选择数量 selectQuantity
 */
class MealData {
  constructor(meal) {
    this.selectQuantity = 0
    this.data = meal
  }

  // 添加数量
  increase() {
    this.selectQuantity++
  }

  // 减少数量
  decrease() {
    if (this.selectQuantity) this.selectQuantity--
  }

  // 获取该菜品的总价格
  get totalPrice() {
    return this.selectQuantity * this.data.price
  }

  // 判断是否添加了该菜品
  get isAddedToCart() {
    return this.selectQuantity > 0
  }
}

/**
 * 整个页面的数据
 */
class PageData {
  constructor() {
    let mealsList = []
    for (const item of meals) {
      mealsList.push(new MealData(item))
    }
    this.mealsList = mealsList
    this.minimumDeliveryAmount = 100 // 起送金额
  }

  increase(index) {
    this.mealsList[index].increase()
  }

  decrease(index) {
    this.mealsList[index].decrease()
  }

  // 获取订单总额
  get totalPrice() {
    return this.mealsList.reduce((prev, cur) => {
      return prev + cur.totalPrice
    }, 0)
  }

  // 获取购物车内菜品数量
  getCartTotalNum() {
    return this.mealsList.reduce((prev, cur) => {
      return prev + cur.selectQuantity
    }, 0)
  }

  // 判断是否满足起送金额
  get isCanDelivery() {
    return this.totalPrice >= this.minimumDeliveryAmount
  }

  // 获取与起送金额的差额
  getNeedCostToDelivery() {
    return this.minimumDeliveryAmount - this.totalPrice
  }
}

/**
 * 界面相关
 */
class UIRender {
  constructor() {
    this.pageData = new PageData()
    this.doms = {
      list: document.getElementById('list'),
      totalPriceSpan: document.querySelector('.total-price span'), // 总价格
      needCostSpan: document.querySelector('.need-cost span'), // 起送差额具体金额
      needCost: document.querySelector('.need-cost'), // 起送差额
      settle: document.querySelector('.settle'), // 结算按钮
      cart: document.querySelector('.cart') // 购物车
    }
    this.init()
  }

  init() {
    this.renderList()
    this.updateCartBar()
    // this.getCartRect()
  }

  /**
   * 渲染菜品列表
   */
  renderList() {
    let html = ''
    for (let index = 0; index < this.pageData.mealsList.length; index++) {
      const item = this.pageData.mealsList[index]
      html += `
        <div class="item">
          <div>${item.data.name}</div>
          <div>${item.data.price}</div>
          <div class="count-box">
            <span data-index="${index}" class="dec">-</span> <span class="count">${item.selectQuantity}</span> <span data-index="${index}" class="add">+</span>
          </div>
        </div>
      `
    }
    for (const item of this.pageData.mealsList) {
    }
    this.doms.list.innerHTML = html
  }

  /**
   * 点击某个菜品的添加按钮
   * @param {Number} index 选择的菜品 index
   */
  increase(index) {
    this.pageData.increase(index)
    this.updateMealItem(index)
    this.updateCartBar()
    this.addAnimate(index)
  }

  /**
   * 点击某个菜品的减少按钮
   * @param {Number} index 选择的菜品 index
   */
  decrease(index) {
    this.pageData.decrease(index)
    this.updateMealItem(index)
    this.updateCartBar()
  }

  /**
   * 增减数量后更新菜品界面，如果数量为 0 则隐藏减号和数字，即去掉 active 类
   * @param {Number} index 选择的菜品 index
   */
  updateMealItem(index) {
    const itemDom = this.doms.list.children[index]
    if (this.pageData.mealsList[index].isAddedToCart) {
      itemDom.classList.add('active')
    } else {
      itemDom.classList.remove('active')
    }
    // 改变数字
    itemDom.querySelector('.count').textContent =
      this.pageData.mealsList[index].selectQuantity
  }

  /**
   * 更新底部购物车栏数据
   */
  updateCartBar() {
    this.doms.totalPriceSpan.textContent = this.pageData.totalPrice
    if (this.pageData.isCanDelivery) {
      this.doms.settle.classList.add('active')
      this.doms.needCost.classList.remove('active')
    } else {
      this.doms.settle.classList.remove('active')
      this.doms.needCost.classList.add('active')
      this.doms.needCostSpan.textContent = this.pageData.getNeedCostToDelivery()
    }
  }

  /**
   * 添加动画
   */
  addAnimate(index) {
    // 获取当前加号按钮的位置
    const rect = this.doms.list.children[index]
      .querySelector('.add')
      .getBoundingClientRect()
    const startPoint = {
      x: rect.left,
      y: rect.top
    }
    // 生成新的加号，用于添加动画
    const div = document.createElement('div')
    div.classList.add('ani-icon')
    const span = document.createElement('span')
    span.textContent = '+'
    div.appendChild(span)
    div.style.position = 'absolute'
    div.style.transform = `translateX(${startPoint.x}px)`
    span.style.transform = `translateY(${startPoint.y}px)`
    document.body.appendChild(div)
    // 为了看到动画，先获取一下div的布局信息，强行渲染
    // div.clientWidth
    // 给外部的 div 一个水平方向的动画
    div.style.transform = `translateX(${this.getCartRect().x}px)`
    // 给内部的 span 一个垂直方向的动画（结合贝塞尔曲线以实现加号的抛物线运动）
    span.style.transform = `translateY(${this.getCartRect().y}px)`
    // 监听动画结束，删除 div
    div.addEventListener(
      'transitionend',
      () => {
        div.remove()
      },
      {
        once: true
      }
    )
  }

  /**
   * 获取购物车的位置信息
   */
  getCartRect() {
    // 获取购物车的位置
    const rect = this.doms.cart.getBoundingClientRect()
    const target = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 4
    }
    return target
  }
}

const ui = new UIRender()

// 添加事件
ui.doms.list.addEventListener('click', event => {
  // 判断触发事件的是不是加号或减号
  if (event.target.classList.contains('add')) {
    ui.increase(event.target.dataset.index)
  } else if (event.target.classList.contains('dec')) {
    ui.decrease(event.target.dataset.index)
  }
})
