VeeValidateI18n.loadLocaleFromURL('./js/zh_TW.json');
    VeeValidate.configure({
        generateMessage: VeeValidateI18n.localize('zh_TW'),
        // validateOnInput: true, // 調整為輸入字元立即進行驗證
    });
    Object.keys(VeeValidateRules).forEach(rule => {
        if (rule !== 'default') {
            VeeValidate.defineRule(rule, VeeValidateRules[rule]);
        }
    });
const url="https://vue3-course-api.hexschool.io/v2"
const api_path="itsmerain"


const emitter=mitt()

const app = Vue.createApp({
    data() {
        return {
            user:{
                username:"",
                password:""
            },
            products:[],
            tempProduct:{},
            carts:[],
            final_total:"",
            total:"",
            tempCart:{},
            loadingItem:"",
            coupons:[],
            order:{
                user:{
                    name:"",
                    email:"",
                    tel:"",
                    address:""
                },
                message:""
            }
        }
    },
    methods: {
        signin(){
            axios.post(`${url}/admin/signin`,this.user)
            .then(res=>{
                console.log(res.data);
                const { token,expired }=res.data
                document.cookie = `myToken=${token}; expires=${expired}`;
                const myCookie = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                axios.defaults.headers.common['Authorization'] = myCookie;
                this.getProducts()
                this.getCart()
                this.getCoupons()
                // this.getAllProducts()
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        getProducts(){
            axios.get(`${url}/api/${api_path}/products?page=2`)
            .then(res=>{
                // console.log(res.data.products);
                this.products=res.data.products
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        postCart( item , qty = 1){
            this.tempProduct=item
            this.loadingItem=item.id
            axios.post(`${url}/api/${api_path}/cart`,{data:{product_id:this.tempProduct.id,qty:qty}}) //相同產品會 + qty數量
            .then(res=>{
                // console.log(res.data);
                this.loadingItem=""
                this.getCart()
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        putCart(item){
            this.tempCart=item
            axios.put(`${url}/api/${api_path}/cart/${item.id}`,{data:{product_id:item.product.id,qty:item.qty}}) //相同產品會 + qty數量
            .then(res=>{
                // console.log(res.data);
                this.getCart()
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        getCart(){
            axios.get(`${url}/api/${api_path}/cart`)
            .then(res=>{
                console.log(res.data.data.carts);
                this.carts=res.data.data.carts
                this.total=res.data.data.total
                this.final_total=res.data.data.final_total
                this.finalTotal() //第一次透過 watch 監聽 coupons執行 第二次開始此函式才有功能
            })
            .catch(err=>{
                console.dir(err);
            })
        },
        delCart(id){
            this.loadingItem=id
            axios.delete(`${url}/api/${api_path}/cart/${id}`)
            .then(res=>{
                this.loadingItem=""
                this.getCart()
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        delAllCart(){
            axios.delete(`${url}/api/${api_path}/carts`)
            .then(res=>{
                this.getCart()
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        openModal(item){
            this.tempProduct={...item}
            this.loadingItem=item.id
            axios.get(`${url}/api/${api_path}/product/${item.id}`)
            .then(res=>{
                // console.log(res.data.products);
                this.$refs.modal.openModal()
                this.loadingItem=""
            })
            .catch(err=>{
                console.log(err.data);
            })
            
        },
        check(){
            axios.post(`${url}/api/user/check`)
            .then(res=>{
                console.log(res.data);
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        getCoupons(){
            axios.get(`${url}/api/${api_path}/admin/coupons`)
            .then(res=>{
                // console.log(res.data.coupons);
                this.coupons=res.data.coupons[0]
            })
            .catch(err=>{
                console.log(err.data);
            })
        },
        finalTotal(){
            let final_total=0
            this.carts.forEach(item => {
                final_total += item.final_total - ( item.qty * this.coupons.percent )
            });
            this.final_total=final_total
        },
        getAllProducts(){
            // axios.get(`${url}/api/${api_path}/products/all`)
            // .then(res=>{
            //     let products= Object.values(res.data.products)
            //     console.log(products);
            // })
            // .catch(err=>{
            //     console.log(err.data);
            // })
        },
        postOrder(){
            axios.post(`${url}/api/${api_path}/order`,{data:this.order}) //相同產品會 + qty數量
            .then(res=>{
                this.getCart()
                this.$refs.form.resetForm()
                alert(res.data.message);
            })
            .catch(err=>{
                console.log(err.message);
            })
        }
    },
    watch: {
        coupons(){
            this.finalTotal()
        }
    },
    mounted() {
        this.signin()
    }
})

app.component("productModal",{
    data() {
        return {
            myModal:'',
            qty:1,
            loadingItem:""
        }
    },
    methods:{
        openModal(){
            this.myModal.show()
        },
        postCart(){
            this.$emit('post-cart',this.tempProduct,this.qty)
            this.myModal.hide()
            this.qty=1
        },
        closeModal(){
            this.myModal.hide()
            this.qty=1
        }
    },
    props:['tempProduct'],
    template:"#userProductModal"
    ,
    mounted() {
        this.myModal = new bootstrap.Modal(this.$refs.modal)
        // this.myModal.show()
    },
})

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);




app.mount('#app')