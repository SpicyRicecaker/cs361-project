<script>
    const {addScene, i} = $props()

</script>

<div 
    class="bg-black p-9 text-3xl border-4 h-[80%] border-white border-solid text-white z-99 select-none hover:cursor-pointer hover:bg-white grid
    hover:text-black
    "

    on:dragover={(e) => {
        e.preventDefault()
    }}
    
    on:drop={(e) => {
        e.preventDefault()
        const dataBaseItemID = parseInt(e.dataTransfer.getData("text/plain"))
        console.log(dataBaseItemID)
        addScene(dataBaseItemID, i)
    }}
    >
        <div class="place-self-center">+</div>
</div>