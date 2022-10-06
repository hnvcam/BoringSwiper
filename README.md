# Why this project?
I've searched for Swiper implementation on github and most of them utilize ScrollView for circular swiping, which is great for many items. However, there is small problem of that mechanism, there is a flicker when it has to rerender the item, which is fine for images or simple components but it's annoyed for complex components.

# How this is different?
Well, I use Animated.View with translateX transformation to move the item into the right place instead of rerendering to new position which should be smooth for complex components.
But there will be a trade off, it would not work well will too many items, I haven't checked for the right limit yet. But it works well now for a small number of items.

# How to use?
> Pls have a look at: https://github.com/hnvcam/BoringSwiper

### BoringSwiper

| Prop | Default | Note |
|---|---|---|
| index | 0 | This indicates which item is active |
| onChangeIndex | (required) | Whenever swiping more than 1/3 of the container width, this function will be called <br/> * true: no reset, there will be updates based on new value of index <br/> * false: reset back to current selection |
| containerStyle | | This is the style of Animated.View wrapper of all items |
| pageStyle | | This is the style of Animated.View wrapper of each item (a page) |

### BoringDots

| Prop | Default | Note |
|---|---|---|
| size | 10 | The normal size of the dot |
| magnifiedSize | 15 | The magnified size of the active dot |
| count | | How many dots? |
| activeIndex | | Which dot is active (magnified)? |
| color | #000000 | Which color? Will be overwriten by dotStyle |
| dotStyle | | Style of Animated.View of the dot |
