import {createPopper} from "@popperjs/core";

export default {
    mounted(el, binding, vnode, prevVnode) {
        const rightLeft = binding.modifiers.right ? 'right' : 'left';

        const tooltip = document.createElement("div");
        tooltip.classList.add('tooltip');
        tooltip.classList.add('error');
        tooltip.classList.add(rightLeft);

        if (!binding.value)
            tooltip.classList.add('empty-tooltip');

        const tooltipInner = document.createElement("span");
        tooltipInner.innerText = binding.value;
        tooltipInner.classList.add('tooltip-inner');

        const tooltipArrow = document.createElement("span");
        tooltipArrow.classList.add('tooltip-arrow');

        tooltip.appendChild(tooltipInner);
        tooltip.appendChild(tooltipArrow);

        el.parentNode.insertBefore(tooltip, el.nextSibling);
        binding.instance.popper = createPopper(el, tooltip, {placement: rightLeft, strategy: 'fixed'});
    },

    updated(el, binding, vnode, prevVnode) {
        const tooltip = el.nextSibling;
        tooltip.firstChild.innerText = binding.value;

        if (binding.value) tooltip.classList.remove('empty-tooltip');
        else tooltip.classList.add('empty-tooltip');

        binding.instance.popper.update();
    },

    beforeUnmount(el, binding, vnode, prevVnode) {
        const tooltip = el.nextSibling;
        el.parentNode.removeChild(tooltip);
    }
};